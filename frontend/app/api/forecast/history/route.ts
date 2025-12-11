/**
 * Forecast History API Route
 * 
 * GET /api/forecast/history
 * Retrieves past sales forecast predictions from database
 * 
 * Query Parameters:
 * - limit: Number of recent forecasts to return (default: 30)
 * - model: Filter by model type (optional)
 * 
 * Team: Sereno, Page, Dulce, Laudato
 * Teacher: Sir Charlston Sean Gono
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') || '30')
    const modelFilter = searchParams.get('model')
    
    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 365) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 365' },
        { status: 400 }
      )
    }
    
    // Build query
    let query = supabaseAdmin
      .from('sales_forecasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Apply model filter if provided
    if (modelFilter) {
      query = query.ilike('model_used', `%${modelFilter}%`)
    }
    
    const { data: forecasts, error } = await query
    
    if (error) {
      console.error('Error fetching forecast history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch forecast history', message: error.message },
        { status: 500 }
      )
    }
    
    if (!forecasts || forecasts.length === 0) {
      return NextResponse.json({
        success: true,
        forecasts: [],
        total: 0,
        message: 'No forecast history found'
      })
    }
    
    // Group by date and aggregate
    const forecastsByDate = forecasts.reduce((acc: any, f: any) => {
      const date = f.forecast_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(f)
      return acc
    }, {})
    
    // Calculate statistics
    const dates = Object.keys(forecastsByDate).sort()
    const summary = {
      total_forecasts: forecasts.length,
      unique_dates: dates.length,
      date_range: {
        earliest: dates[0],
        latest: dates[dates.length - 1]
      },
      avg_confidence: Math.round(
        forecasts.reduce((sum: number, f: any) => sum + (f.confidence_score || 0), 0) / forecasts.length
      ),
      models_used: [...new Set(forecasts.map((f: any) => f.model_used))]
    }
    
    return NextResponse.json({
      success: true,
      forecasts: forecasts.map((f: any) => ({
        id: f.id,
        forecast_date: f.forecast_date,
        predicted_sales: f.predicted_sales,
        lower_bound: f.lower_bound,
        upper_bound: f.upper_bound,
        confidence_score: f.confidence_score,
        model_used: f.model_used,
        periods_ahead: f.periods_ahead,
        created_at: f.created_at
      })),
      summary,
      total: forecasts.length
    })
    
  } catch (error) {
    console.error('Error in forecast history API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
