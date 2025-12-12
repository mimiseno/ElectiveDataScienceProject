/**
 * Register API Route
 * Handles user registration with Supabase
 * Creates user profile and logs activity
 * 
 * Team: Sereno, Page, Dulce, Laudato
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase not configured')
      return NextResponse.json(
        { success: false, error: 'Database not configured. Please check server configuration.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (authError) {
      console.error('Signup error:', authError)
      return NextResponse.json(
        { success: false, error: authError.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Create user profile in public.users table
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        role: 'user',
        status: 'active',
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      
      // Note: Cannot delete auth user here without admin SDK
      // User will exist in auth.users but not in public.users
      // This should be cleaned up manually or with a serverless function
      
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile. Please contact support.' },
        { status: 500 }
      )
    }

    // Log registration activity
    await logActivity(userData.id, 'register', {
      email: userData.email,
      name: userData.name,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    })

    // Update dashboard stats
    await updateDashboardStats()

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar_url,
      },
      session: authData.session,
      message: 'Account created successfully',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to log user activity
async function logActivity(
  userId: string,
  activityType: string,
  metadata: Record<string, any>
) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      activity_type: activityType,
      activity_category: 'auth',
      description: `User ${activityType}`,
      metadata,
      ip_address: metadata.ip,
      user_agent: metadata.user_agent,
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

// Helper function to update dashboard stats
async function updateDashboardStats() {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Update or insert stats
    await supabase
      .from('dashboard_stats')
      .upsert([
        {
          stat_type: 'total_users',
          stat_value: totalUsers || 0,
          stat_trend: 'up',
          last_updated_at: new Date().toISOString(),
        },
        {
          stat_type: 'active_users',
          stat_value: activeUsers || 0,
          stat_trend: 'up',
          last_updated_at: new Date().toISOString(),
        },
      ])
  } catch (error) {
    console.error('Failed to update dashboard stats:', error)
  }
}
