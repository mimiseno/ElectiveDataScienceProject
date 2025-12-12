/**
 * Login API Route
 * Handles user authentication with Supabase
 * Logs activity and returns user data
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
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Fetch user profile from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url, status')
      .eq('email', email)
      .single()

    if (userError) {
      // If user doesn't exist in public.users, create one
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.email?.split('@')[0] || 'User',
          role: 'user',
          status: 'active',
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user profile:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create user profile' },
          { status: 500 }
        )
      }

      // Log login activity
      await logActivity(newUser.id, 'login', {
        email: newUser.email,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          avatar: newUser.avatar_url,
        },
        session: authData.session,
      })
    }

    // Check if user is active
    if (userData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account is inactive or suspended' },
        { status: 403 }
      )
    }

    // Update last login timestamp
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userData.id)

    // Log login activity
    await logActivity(userData.id, 'login', {
      email: userData.email,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    })

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
    })
  } catch (error) {
    console.error('Login error:', error)
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
