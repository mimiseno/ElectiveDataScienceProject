/**
 * Monthly Active Users API Route
 * 
 * GET /api/stats/monthly-users
 * Fetches monthly active user statistics from Supabase database
 * 
 * Returns:
 * - Monthly user login counts for the past 12 months
 * - User growth trends
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
          mockData: true,
          monthlyUsers: getMockMonthlyUsers(),
        },
        { status: 200 }
      )
    }

    // Fetch users with their last login dates
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('created_at, last_login_at, status')
      .order('created_at', { ascending: true })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        {
          error: 'Failed to fetch user data',
          message: usersError.message,
          mockData: true,
          monthlyUsers: getMockMonthlyUsers(),
        },
        { status: 200 }
      )
    }

    // Process data to get monthly active users for past 12 months
    const now = new Date()
    const monthlyData: Record<string, { active: number; new: number; total: number }> = {}

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
      monthlyData[monthKey] = { active: 0, new: 0, total: 0 }
    }

    // Count users by month
    if (users) {
      users.forEach((user) => {
        const createdMonth = user.created_at?.substring(0, 7)
        const loginMonth = user.last_login_at?.substring(0, 7)

        // Count new users
        if (createdMonth && monthlyData[createdMonth]) {
          monthlyData[createdMonth].new++
        }

        // Count active users (logged in during that month)
        if (loginMonth && monthlyData[loginMonth]) {
          monthlyData[loginMonth].active++
        }
      })

      // Calculate cumulative total users
      let cumulativeTotal = 0
      Object.keys(monthlyData)
        .sort()
        .forEach((month) => {
          cumulativeTotal += monthlyData[month].new
          monthlyData[month].total = cumulativeTotal
        })
    }

    // Format response
    const formattedData = Object.entries(monthlyData).map(([month, data]) => {
      const date = new Date(month + '-01')
      const monthName = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })

      return {
        month: monthName,
        monthKey: month,
        activeUsers: data.active,
        newUsers: data.new,
        totalUsers: data.total,
      }
    })

    return NextResponse.json({
      success: true,
      mockData: false,
      monthlyUsers: formattedData,
      summary: {
        currentMonthActive: formattedData[formattedData.length - 1]?.activeUsers || 0,
        totalUsers: formattedData[formattedData.length - 1]?.totalUsers || 0,
        growthRate: calculateGrowthRate(formattedData),
      },
    })
  } catch (error) {
    console.error('Unexpected error in monthly users API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        mockData: true,
        monthlyUsers: getMockMonthlyUsers(),
      },
      { status: 500 }
    )
  }
}

// Calculate month-over-month growth rate
function calculateGrowthRate(data: any[]): number {
  if (data.length < 2) return 0

  const currentMonth = data[data.length - 1]?.activeUsers || 0
  const previousMonth = data[data.length - 2]?.activeUsers || 0

  if (previousMonth === 0) return currentMonth > 0 ? 100 : 0

  return Math.round(((currentMonth - previousMonth) / previousMonth) * 100)
}

// Mock data fallback when database is not configured
function getMockMonthlyUsers() {
  const months = [
    'Jan 2025',
    'Feb 2025',
    'Mar 2025',
    'Apr 2025',
    'May 2025',
    'Jun 2025',
    'Jul 2025',
    'Aug 2025',
    'Sep 2025',
    'Oct 2025',
    'Nov 2025',
    'Dec 2025',
  ]

  return months.map((month, index) => ({
    month,
    monthKey: `2025-${String(index + 1).padStart(2, '0')}`,
    activeUsers: 0,
    newUsers: 0,
    totalUsers: 0,
  }))
}
