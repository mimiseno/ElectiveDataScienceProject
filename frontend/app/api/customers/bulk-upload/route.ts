/**
 * Bulk Customer Dataset Upload API Route
 * 
 * POST /api/customers/bulk-upload
 * Processes CSV files containing customer RFM data for batch segmentation
 * 
 * Workflow:
 * 1. Receives CSV file from frontend
 * 2. Parses CSV and validates data
 * 3. Calls Flask API for each customer's prediction
 * 4. Saves all results to Supabase
 * 5. Creates segment distribution summary
 * 6. Returns analysis results
 * 
 * Team: Sereno, Page, Dulce, Laudato
 * Teacher: Sir Charlston Sean Gono
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { predictCustomerSegmentBulk } from '@/lib/flask-client'

interface CustomerRow {
  customer_id: string
  recency: number
  frequency: number
  monetary: number
}

interface ProcessingResult {
  customer_id: string
  cluster: number
  cluster_name: string
  confidence: number
  success: boolean
  error?: string
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
    console.log('Reading CSV file...')
    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no data rows' },
        { status: 400 }
      )
    }

    // Parse header
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const requiredColumns = ['customer_id', 'recency', 'frequency', 'monetary']

    // Validate required columns
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col))
    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${missingColumns.join(', ')}`,
          hint: 'CSV must have columns: customer_id, recency, frequency, monetary',
        },
        { status: 400 }
      )
    }

    // Get column indices
    const indices = {
      customer_id: headers.indexOf('customer_id'),
      recency: headers.indexOf('recency'),
      frequency: headers.indexOf('frequency'),
      monetary: headers.indexOf('monetary'),
    }

    // Track upload in database
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from('dataset_uploads')
      .insert({
        filename: file.name,
        file_size_kb: file.size / 1024,
        file_type: 'csv',
        dataset_type: 'customer_rfm',
        total_rows: lines.length - 1,
        processing_status: 'processing',
      })
      .select()
      .single()

    if (uploadError) {
      console.error('Failed to track upload:', uploadError)
    }

    const uploadId = upload?.id

    // Parse data rows
    console.log('Parsing customer data...')
    const customers: CustomerRow[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())

      if (values.length < requiredColumns.length) {
        errors.push(`Row ${i + 1}: Incomplete data`)
        continue
      }

      const customer = {
        customer_id: values[indices.customer_id],
        recency: Number(values[indices.recency]),
        frequency: Number(values[indices.frequency]),
        monetary: Number(values[indices.monetary]),
      }

      // Validate data
      if (!customer.customer_id) {
        errors.push(`Row ${i + 1}: Missing customer_id`)
        continue
      }

      if (isNaN(customer.recency) || customer.recency < 1 || customer.recency > 400) {
        errors.push(`Row ${i + 1}: Invalid recency (must be 1-400)`)
        continue
      }

      if (isNaN(customer.frequency) || customer.frequency < 1 || customer.frequency > 10) {
        errors.push(`Row ${i + 1}: Invalid frequency (must be 1-10)`)
        continue
      }

      if (isNaN(customer.monetary) || customer.monetary < 0 || customer.monetary > 50000) {
        errors.push(`Row ${i + 1}: Invalid monetary (must be ₱0-₱50,000)`)
        continue
      }

      customers.push(customer)
    }

    if (customers.length === 0) {
      // Update upload status
      if (uploadId) {
        await supabaseAdmin
          .from('dataset_uploads')
          .update({
            processing_status: 'failed',
            error_message: 'No valid customer records found',
            failed_rows: errors.length,
          })
          .eq('id', uploadId)
      }

      return NextResponse.json(
        {
          error: 'No valid customer records found in CSV',
          errors: errors.slice(0, 10),
        },
        { status: 400 }
      )
    }

    // Process customers using optimized bulk endpoint
    console.log(`Processing ${customers.length} customers in bulk...`)
    const results: ProcessingResult[] = []
    const segmentCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }
    let successCount = 0
    let failCount = 0

    // Call Flask bulk API once for all customers
    const bulkPrediction = await predictCustomerSegmentBulk(customers)

    if (bulkPrediction.success && bulkPrediction.data) {
      const flaskResults = bulkPrediction.data.results

      // Prepare bulk insert data
      const customersToInsert = []

      for (const result of flaskResults) {
        if (result.success) {
          // Prepare for bulk insert
          customersToInsert.push({
            customer_external_id: result.customer_id,
            recency: result.recency,
            frequency: result.frequency,
            monetary: result.monetary,
            monetary_brl: result.monetary_brl,
            segment_cluster: result.cluster,
            segment_name: result.cluster_name,
            confidence_score: result.confidence,
            last_analyzed_at: new Date().toISOString(),
          })

          segmentCounts[result.cluster]++
          successCount++

          results.push({
            customer_id: result.customer_id,
            cluster: result.cluster,
            cluster_name: result.cluster_name,
            confidence: result.confidence,
            success: true,
          })
        } else {
          failCount++
          results.push({
            customer_id: result.customer_id,
            cluster: -1,
            cluster_name: 'Error',
            confidence: 0,
            success: false,
            error: result.error || 'Prediction failed',
          })
        }
      }

      // Bulk insert to database (much faster than individual upserts)
      if (customersToInsert.length > 0) {
        console.log(`Bulk inserting ${customersToInsert.length} customers to database...`)
        const { error: insertError } = await supabaseAdmin
          .from('customers')
          .upsert(customersToInsert, {
            onConflict: 'customer_external_id',
            ignoreDuplicates: false,
          })

        if (insertError) {
          console.error('Bulk insert error:', insertError)
        }
      }
    } else {
      // Fallback: Flask bulk API failed, return error
      if (uploadId) {
        await supabaseAdmin
          .from('dataset_uploads')
          .update({
            processing_status: 'failed',
            error_message: bulkPrediction.error || 'Flask bulk prediction failed',
          })
          .eq('id', uploadId)
      }

      return NextResponse.json(
        {
          error: 'Bulk prediction failed',
          message: bulkPrediction.error,
        },
        { status: 500 }
      )
    }

    // Calculate segment distribution
    const totalProcessed = successCount
    const segmentNames: Record<number, string> = {
      0: 'Loyal Customers',
      1: 'Lost Customers',
      2: 'Champions',
      3: 'At Risk',
    }

    const distribution = Object.entries(segmentCounts).map(([cluster, count]) => ({
      cluster: Number(cluster),
      name: segmentNames[Number(cluster)],
      count,
      percentage: totalProcessed > 0 ? ((count / totalProcessed) * 100).toFixed(1) : '0',
    }))

    // Save segment distribution to database
    if (uploadId && successCount > 0) {
      for (const seg of distribution) {
        if (seg.count > 0) {
          await supabaseAdmin.from('segment_distributions').insert({
            upload_id: uploadId,
            segment_cluster: seg.cluster,
            segment_name: seg.name,
            customer_count: seg.count,
            percentage: parseFloat(seg.percentage),
          })
        }
      }
    }

    // Update upload status
    if (uploadId) {
      await supabaseAdmin
        .from('dataset_uploads')
        .update({
          processing_status: successCount > 0 ? 'completed' : 'failed',
          processed_rows: successCount,
          failed_rows: failCount,
          processed_at: new Date().toISOString(),
        })
        .eq('id', uploadId)
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      activity_type: 'bulk_segmentation',
      activity_category: 'segmentation',
      description: `Processed ${successCount} customers from ${file.name}`,
      metadata: {
        filename: file.name,
        total_rows: customers.length,
        success_count: successCount,
        fail_count: failCount,
        upload_id: uploadId,
      },
    })

    // Update dashboard stats
    await supabaseAdmin.rpc('update_dashboard_stats')

    return NextResponse.json({
      success: true,
      upload_id: uploadId,
      total_customers: customers.length,
      processed: successCount,
      failed: failCount,
      distribution,
      validation_errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    })
  } catch (error) {
    console.error('Error in bulk upload API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
