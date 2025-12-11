/**
 * Dashboard Stats API Route
 * 
 * GET /api/stats/dashboard
 * Fetches real-time dashboard statistics from Supabase database
 * 
 * Returns:
 * - Total users
 * - Active users  
 * - New users this month
 * - Segments analyzed today
 * - Forecasts generated today
 * - Recent activity logs
 * 
 * Team: Sereno, Page, Dulce, Laudato
 * Teacher: Sir Charlston Sean Gono
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabase-server'

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json(
        {
          error: 'Database not configured',
          message: 'Please set up Supabase environment variables',
          mockData: true,
          stats: getMockStats(),
        },
        { status: 200 }
      )
    }

    // Fetch dashboard stats from database (using admin client to bypass RLS)
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('dashboard_stats')
      .select('*')

    if (statsError) {
      console.error('Error fetching dashboard stats:', statsError)
      return NextResponse.json(
        {
          error: 'Failed to fetch dashboard stats',
          message: statsError.message,
          mockData: true,
          stats: getMockStats(),
        },
        { status: 200 }
      )
    }

    // Transform stats array to object
    const statsMap: Record<string, any> = {}
    if (stats) {
      stats.forEach((stat) => {
        statsMap[stat.stat_type] = {
          value: stat.stat_value,
          change: stat.stat_change,
          trend: stat.stat_trend,
          lastUpdated: stat.last_updated_at,
        }
      })
    }

    // Fetch recent activity logs
    const { data: activities, error: activityError } = await supabaseAdmin
      .from('activity_logs')
      .select(`
        id,
        activity_type,
        activity_category,
        description,
        created_at,
        users (
          name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (activityError) {
      console.error('Error fetching activity logs:', activityError)
    }

    // Get user statistics from view
    const { data: userStats, error: userStatsError } = await supabaseAdmin
      .from('v_user_statistics')
      .select('*')
      .single()

    if (userStatsError) {
      console.error('Error fetching user statistics:', userStatsError)
    }

    return NextResponse.json({
      success: true,
      mockData: false,
      stats: {
        total_users: statsMap.total_users || {
          value: userStats?.total_users || 0,
          change: 0,
          trend: 'neutral',
        },
        active_users: statsMap.active_users || {
          value: userStats?.active_users || 0,
          change: 0,
          trend: 'up',
        },
        new_users_this_month: statsMap.new_users_this_month || {
          value: userStats?.new_users_this_month || 0,
          change: 0,
          trend: 'up',
        },
        segments_analyzed_today: statsMap.segments_analyzed_today || {
          value: 0,
          change: 0,
          trend: 'neutral',
        },
        forecasts_generated_today: statsMap.forecasts_generated_today || {
          value: 0,
          change: 0,
          trend: 'neutral',
        },
        avg_session_time: statsMap.avg_session_time || {
          value: 0,
          change: 0,
          trend: 'neutral',
        },
      },
      recentActivity: activities || [],
      userStats: userStats || null,
    })
  } catch (error) {
    console.error('Unexpected error in dashboard stats API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        mockData: true,
        stats: getMockStats(),
      },
      { status: 500 }
    )
  }
}

// Mock data fallback when database is not configured
function getMockStats() {
  return {
    total_users: { value: 0, change: 0, trend: 'neutral' },
    active_users: { value: 0, change: 0, trend: 'neutral' },
    new_users_this_month: { value: 0, change: 0, trend: 'neutral' },
    segments_analyzed_today: { value: 0, change: 0, trend: 'neutral' },
    forecasts_generated_today: { value: 0, change: 0, trend: 'neutral' },
    avg_session_time: { value: 0, change: 0, trend: 'neutral' },
  }
}
