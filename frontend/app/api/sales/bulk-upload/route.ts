/**
 * Sales Bulk Upload API Route
 * 
 * POST /api/sales/bulk-upload
 * Processes CSV files containing historical sales data
 * 
 * Supports TWO formats:
 * 1. Aggregated: date, sales_amount, order_count
 * 2. Order-level (Online-Retail format): InvoiceNo, Quantity, InvoiceDate, UnitPrice
 * 
 * Workflow:
 * 1. Receives CSV file from frontend
 * 2. Detects format and parses CSV
 * 3. Aggregates order-level data to daily if needed
 * 4. Saves all records to Supabase sales table
 * 5. Creates summary statistics
 * 6. Returns upload results
 * 
 * Team: Sereno, Page, Dulce, Laudato
 * Teacher: Sir Charlston Sean Gono
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

interface SalesRow {
  date: string
  sales_amount: number
  order_count: number
}

interface OrderRow {
  invoice_date: string
  quantity: number
  unit_price: number
  invoice_no: string
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      )
    }
    
    // Read and parse CSV
    console.log('Reading sales CSV file...')
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no data rows' },
        { status: 400 }
      )
    }
    
    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    // Detect format: Aggregated vs Order-Level (Online-Retail)
    const hasAggregatedFormat = headers.includes('date') && headers.includes('sales_amount')
    const hasOrderFormat = headers.includes('invoicedate') && headers.includes('quantity') && headers.includes('unitprice')
    
    if (!hasAggregatedFormat && !hasOrderFormat) {
      return NextResponse.json(
        {
          error: 'Unrecognized CSV format',
          hint: 'CSV must have either: (1) date, sales_amount columns, OR (2) InvoiceDate, Quantity, UnitPrice columns (Online-Retail format)',
          detected_columns: headers.slice(0, 10).join(', ')
        },
        { status: 400 }
      )
    }
    
    // Track upload in database
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from('dataset_uploads')
      .insert({
        filename: file.name,
        file_size_kb: file.size / 1024,
        file_type: 'csv',
        dataset_type: 'sales_history',
        total_rows: lines.length - 1,
        processing_status: 'processing'
      })
      .select()
      .single()
    
    if (uploadError) {
      console.error('Failed to track upload:', uploadError)
    }
    
    const uploadId = upload?.id
    
    let salesRecords: SalesRow[] = []
    const errors: string[] = []
    
    if (hasAggregatedFormat) {
      // Parse aggregated format: date, sales_amount, order_count
      console.log('Detected aggregated sales format')
      const indices = {
        date: headers.indexOf('date'),
        sales_amount: headers.indexOf('sales_amount'),
        order_count: headers.indexOf('order_count')
      }
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        
        if (values.length < 2) {
          errors.push(`Row ${i + 1}: Incomplete data`)
          continue
        }
        
        const dateStr = values[indices.date]
        const salesAmount = Number(values[indices.sales_amount])
        const orderCount = indices.order_count >= 0 ? Number(values[indices.order_count]) : 1
        
        // Validate date
        const saleDate = new Date(dateStr)
        if (isNaN(saleDate.getTime())) {
          errors.push(`Row ${i + 1}: Invalid date format`)
          continue
        }
        
        // Validate sales amount
        if (isNaN(salesAmount) || salesAmount < 0) {
          errors.push(`Row ${i + 1}: Invalid sales amount`)
          continue
        }
        
        salesRecords.push({
          date: dateStr,
          sales_amount: salesAmount,
          order_count: isNaN(orderCount) ? 1 : orderCount
        })
      }
    } else {
      // Parse order-level format (Online-Retail): InvoiceNo, Quantity, InvoiceDate, UnitPrice
      console.log('Detected order-level format (Online-Retail style)')
      const indices = {
        invoiceNo: headers.indexOf('invoiceno'),
        quantity: headers.indexOf('quantity'),
        invoiceDate: headers.indexOf('invoicedate'),
        unitPrice: headers.indexOf('unitprice')
      }
      
      // Parse all orders first
      const orders: OrderRow[] = []
      
      for (let i = 1; i < lines.length; i++) {
        // Handle CSV with quoted fields (e.g., description with commas)
        const values = parseCSVLine(lines[i])
        
        if (values.length < Math.max(indices.invoiceDate, indices.quantity, indices.unitPrice) + 1) {
          errors.push(`Row ${i + 1}: Incomplete data`)
          continue
        }
        
        const invoiceDateStr = values[indices.invoiceDate]
        const quantity = Number(values[indices.quantity])
        const unitPrice = Number(values[indices.unitPrice])
        const invoiceNo = values[indices.invoiceNo] || ''
        
        // Parse date (handle various formats like "12/1/2010 8:26" or "2010-12-01")
        const invoiceDate = parseFlexibleDate(invoiceDateStr)
        if (!invoiceDate) {
          // Skip silently for large datasets - too many date parsing errors
          continue
        }
        
        // Skip invalid/returned items (negative quantity)
        if (isNaN(quantity) || isNaN(unitPrice)) {
          continue
        }
        
        // Calculate line total (can be negative for returns)
        const lineTotal = quantity * unitPrice
        
        orders.push({
          invoice_date: invoiceDate,
          quantity: quantity,
          unit_price: unitPrice,
          invoice_no: invoiceNo
        })
      }
      
      // Aggregate orders to daily sales
      console.log(`Aggregating ${orders.length} orders to daily sales...`)
      const dailySales: Map<string, { sales: number; orders: Set<string> }> = new Map()
      
      for (const order of orders) {
        const date = order.invoice_date
        const lineTotal = order.quantity * order.unit_price
        
        if (!dailySales.has(date)) {
          dailySales.set(date, { sales: 0, orders: new Set() })
        }
        
        const daily = dailySales.get(date)!
        daily.sales += lineTotal
        if (order.invoice_no) {
          daily.orders.add(order.invoice_no)
        }
      }
      
      // Convert to sales records
      salesRecords = Array.from(dailySales.entries())
        .filter(([_, data]) => data.sales > 0) // Skip days with negative/zero sales (returns only)
        .map(([date, data]) => ({
          date,
          sales_amount: Math.round(data.sales * 100) / 100, // Round to 2 decimals
          order_count: data.orders.size || 1
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    
    if (salesRecords.length === 0) {
      // Update upload status
      if (uploadId) {
        await supabaseAdmin
          .from('dataset_uploads')
          .update({
            processing_status: 'failed',
            error_message: 'No valid sales records found',
            failed_rows: errors.length
          })
          .eq('id', uploadId)
      }
      
      return NextResponse.json(
        {
          error: 'No valid sales records found in CSV',
          errors: errors.slice(0, 10)
        },
        { status: 400 }
      )
    }
    
    // Save sales records to database
    console.log(`Saving ${salesRecords.length} sales records to database...`)
    const salesToInsert = salesRecords.map((record, index) => ({
      transaction_id: `${uploadId}_${record.date}_${index}`, // Unique transaction ID
      sale_date: record.date,
      sale_amount: record.sales_amount,
      order_count: record.order_count,
      customer_id: null, // Bulk uploads don't have customer associations
      product_category: null,
      payment_method: null,
      created_at: new Date().toISOString()
    }))
    
    const { data: savedSales, error: insertError } = await supabaseAdmin
      .from('sales')
      .insert(salesToInsert)
      .select()
    
    if (insertError) {
      console.error('Failed to insert sales:', insertError)
      
      // Update upload status
      if (uploadId) {
        await supabaseAdmin
          .from('dataset_uploads')
          .update({
            processing_status: 'failed',
            error_message: insertError.message
          })
          .eq('id', uploadId)
      }
      
      return NextResponse.json(
        {
          error: 'Failed to save sales data',
          message: insertError.message
        },
        { status: 500 }
      )
    }
    
    // Calculate summary statistics
    const totalSales = salesRecords.reduce((sum, r) => sum + r.sales_amount, 0)
    const totalOrders = salesRecords.reduce((sum, r) => sum + r.order_count, 0)
    const avgDailySales = totalSales / salesRecords.length
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
    
    // Get date range
    const dates = salesRecords.map(r => new Date(r.date).getTime()).sort((a, b) => a - b)
    const startDate = new Date(dates[0]).toISOString().split('T')[0]
    const endDate = new Date(dates[dates.length - 1]).toISOString().split('T')[0]
    
    // Update upload status
    if (uploadId) {
      await supabaseAdmin
        .from('dataset_uploads')
        .update({
          processing_status: 'completed',
          processed_rows: salesRecords.length,
          failed_rows: errors.length,
          processed_at: new Date().toISOString()
        })
        .eq('id', uploadId)
    }
    
    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      activity_type: 'bulk_sales_upload',
      activity_category: 'data_import',
      description: `Uploaded ${salesRecords.length} daily sales records from ${file.name}`,
      metadata: {
        filename: file.name,
        format: hasAggregatedFormat ? 'aggregated' : 'order-level',
        total_rows: salesRecords.length,
        total_sales: totalSales,
        date_range: { start: startDate, end: endDate },
        upload_id: uploadId
      }
    })
    
    // Update dashboard stats
    await supabaseAdmin.rpc('update_dashboard_stats')
    
    return NextResponse.json({
      success: true,
      upload_id: uploadId,
      total_records: salesRecords.length,
      failed_records: errors.length,
      format_detected: hasAggregatedFormat ? 'aggregated' : 'order-level',
      summary: {
        total_sales: Math.round(totalSales),
        total_orders: totalOrders,
        avg_daily_sales: Math.round(avgDailySales),
        avg_order_value: Math.round(avgOrderValue),
        date_range: {
          start: startDate,
          end: endDate,
          days: salesRecords.length
        }
      },
      validation_errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })
    
  } catch (error) {
    console.error('Error in sales bulk upload API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Parse a CSV line handling quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

/**
 * Parse date strings in various formats
 * Supports: "12/1/2010 8:26", "2010-12-01", "12/1/2010", etc.
 */
function parseFlexibleDate(dateStr: string): string | null {
  if (!dateStr) return null
  
  // Try ISO format first (2010-12-01)
  let date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }
  
  // Try MM/DD/YYYY HH:MM format (Online-Retail style)
  const parts = dateStr.split(' ')[0] // Remove time if present
  const dateParts = parts.split('/')
  
  if (dateParts.length === 3) {
    const month = parseInt(dateParts[0])
    const day = parseInt(dateParts[1])
    const year = parseInt(dateParts[2])
    
    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
      // Handle 2-digit year
      const fullYear = year < 100 ? 2000 + year : year
      date = new Date(fullYear, month - 1, day)
      
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    }
  }
  
  return null
}
