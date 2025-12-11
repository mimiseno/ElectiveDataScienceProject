/**
 * Customer Segmentation Analysis API Route
 * 
 * POST /api/customers/analyze
 * Analyzes a single customer's RFM values and predicts their segment
 * 
 * Workflow:
 * 1. Receives RFM data from frontend (in PHP)
 * 2. Calls Flask API for K-Means prediction
 * 3. Saves result to Supabase customers table
 * 4. Logs activity to activity_logs
 * 5. Returns segment classification
 * 
 * Team: Sereno, Page, Dulce, Laudato
 * Teacher: Sir Charlston Sean Gono
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { predictCustomerSegment } from '@/lib/flask-client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recency, frequency, monetary, customer_id } = body

    // Validate input
    if (!recency || !frequency || !monetary) {
      return NextResponse.json(
        { error: 'Missing required fields: recency, frequency, monetary' },
        { status: 400 }
      )
    }

    // Validate ranges (from Flask API INPUT_LIMITS)
    if (recency < 1 || recency > 400) {
      return NextResponse.json(
        { error: 'Recency must be between 1 and 400 days' },
        { status: 400 }
      )
    }

    if (frequency < 1 || frequency > 10) {
      return NextResponse.json(
        { error: 'Frequency must be between 1 and 10 purchases' },
        { status: 400 }
      )
    }

    if (monetary < 0 || monetary > 50000) {
      return NextResponse.json(
        { error: 'Monetary must be between ₱0 and ₱50,000' },
        { status: 400 }
      )
    }

    // Call Flask API for prediction
    console.log('📞 Calling Flask API for customer segmentation...')
    const prediction = await predictCustomerSegment({
      recency: Number(recency),
      frequency: Number(frequency),
      monetary: Number(monetary),
    })

    if (!prediction.success) {
      console.error('Flask API error:', prediction.error)
      return NextResponse.json(
        { error: prediction.error || 'Failed to predict segment' },
        { status: 500 }
      )
    }

    // Generate unique customer ID if not provided
    const customerId = customer_id || `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Save to Supabase customers table
    console.log('💾 Saving customer segment to database...')
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .upsert({
        customer_external_id: customerId,
        recency: Number(recency),
        frequency: Number(frequency),
        monetary: Number(monetary),
        monetary_brl: prediction.data.rfm_values.monetary_brl,
        segment_cluster: prediction.data.cluster,
        segment_name: prediction.data.cluster_name,
        confidence_score: prediction.data.confidence.overall,
        last_analyzed_at: new Date().toISOString(),
      }, {
        onConflict: 'customer_external_id',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (customerError) {
      console.error('Database error saving customer:', customerError)
      // Continue even if save fails - return prediction result
    }

    // Log activity
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        activity_type: 'segment_analysis',
        activity_category: 'segmentation',
        description: `Customer ${customerId} analyzed: ${prediction.data.cluster_name}`,
        metadata: {
          customer_id: customerId,
          cluster: prediction.data.cluster,
          confidence: prediction.data.confidence.overall,
          rfm: { recency, frequency, monetary },
        },
      })
      .select()

    // Update dashboard stats
    await supabaseAdmin.rpc('update_dashboard_stats')

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      cluster: prediction.data.cluster,
      cluster_name: prediction.data.cluster_name,
      description: prediction.data.description,
      recommendations: prediction.data.recommendations,
      confidence: prediction.data.confidence,
      rfm_values: {
        recency: Number(recency),
        frequency: Number(frequency),
        monetary: Number(monetary),
      },
      saved_to_database: !customerError,
    })
  } catch (error) {
    console.error('Error in customer analyze API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
