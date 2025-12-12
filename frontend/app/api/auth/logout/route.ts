/**
 * Logout API Route
 * Handles user logout and activity logging
 * 
 * Team: Sereno, Page, Dulce, Laudato
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    // Log logout activity before signing out
    if (userId) {
      await logActivity(userId, 'logout', {
        timestamp: new Date().toISOString(),
      })
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to logout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
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
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
