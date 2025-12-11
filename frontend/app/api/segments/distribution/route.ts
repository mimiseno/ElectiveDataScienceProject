/**
 * Segment Distribution API Route
 * 
 * GET /api/segments/distribution
 * Fetches customer segment distribution statistics from database
 * 
 * Returns summary of how customers are distributed across segments
 * 
 * Team: Sereno, Page, Dulce, Laudato
 * Teacher: Sir Charlston Sean Gono
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    // Get segment summary from view
    const { data: segments, error: segmentsError } = await supabaseAdmin
      .from('v_segment_summary')
      .select('*')
      .order('segment_cluster', { ascending: true })

    if (segmentsError) {
      console.error('Error fetching segment summary:', segmentsError)
      return NextResponse.json(
        {
          error: 'Failed to fetch segment distribution',
          mockData: true,
          distribution: getMockDistribution(),
        },
        { status: 200 }
      )
    }

    // Get total customer count
    const { count: totalCustomers, error: countError } = await supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting customers:', countError)
    }

    // Transform data for frontend
    const segmentColors: Record<number, string> = {
      0: 'var(--chart-2)', // Loyal Customers
      1: 'var(--chart-5)', // Lost Customers
      2: 'var(--chart-1)', // Champions
      3: 'var(--chart-3)', // At Risk
    }

    const distribution = segments
      ? segments.map((seg) => ({
          cluster: seg.segment_cluster,
          name: seg.segment_name,
          count: seg.customer_count,
          percentage: totalCustomers
            ? parseFloat(((seg.customer_count / totalCustomers) * 100).toFixed(1))
            : 0,
          color: segmentColors[seg.segment_cluster] || 'var(--chart-4)',
          avgRecency: seg.avg_recency ? parseFloat(seg.avg_recency.toFixed(1)) : 0,
          avgFrequency: seg.avg_frequency ? parseFloat(seg.avg_frequency.toFixed(1)) : 0,
          avgMonetary: seg.avg_monetary ? parseFloat(seg.avg_monetary.toFixed(2)) : 0,
          avgConfidence: seg.avg_confidence ? parseFloat(seg.avg_confidence.toFixed(1)) : 0,
        }))
      : []

    return NextResponse.json({
      success: true,
      mockData: false,
      totalCustomers: totalCustomers || 0,
      distribution,
      summary: {
        highestSegment:
          distribution.length > 0
            ? distribution.reduce((prev, current) =>
                prev.count > current.count ? prev : current
              )
            : null,
        lowestSegment:
          distribution.length > 0
            ? distribution.reduce((prev, current) =>
                prev.count < current.count ? prev : current
              )
            : null,
      },
    })
  } catch (error) {
    console.error('Error in segment distribution API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        mockData: true,
        distribution: getMockDistribution(),
      },
      { status: 500 }
    )
  }
}

// Mock data fallback
function getMockDistribution() {
  return [
    {
      cluster: 0,
      name: 'Loyal Customers',
      count: 0,
      percentage: 0,
      color: 'var(--chart-2)',
    },
    {
      cluster: 1,
      name: 'Lost Customers',
      count: 0,
      percentage: 0,
      color: 'var(--chart-5)',
    },
    {
      cluster: 2,
      name: 'Champions',
      count: 0,
      percentage: 0,
      color: 'var(--chart-1)',
    },
    {
      cluster: 3,
      name: 'At Risk',
      count: 0,
      percentage: 0,
      color: 'var(--chart-3)',
    },
  ]
}
