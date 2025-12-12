/**
 * Health Check API Route
 * Checks if Supabase is properly configured
 */

import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    const configured = isSupabaseConfigured()
    
    if (!configured) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase not configured',
        details: {
          supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        instructions: 'Create .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      }, { status: 503 })
    }

    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        details: {
          configured: true,
          connected: false,
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      message: 'All systems operational',
      details: {
        configured: true,
        connected: true,
        database: 'accessible',
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
