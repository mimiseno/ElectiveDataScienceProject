/**
 * Session Check API Route
 * Validates user session and returns current user data
 * 
 * Team: Sereno, Page, Dulce, Laudato
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'No active session',
      })
    }

    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url, status')
      .eq('id', session.user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'User profile not found',
      })
    }

    // Check if user is active
    if (userData.status !== 'active') {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'Account is inactive',
      })
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar_url,
      },
      session: {
        accessToken: session.access_token,
        expiresAt: session.expires_at,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
