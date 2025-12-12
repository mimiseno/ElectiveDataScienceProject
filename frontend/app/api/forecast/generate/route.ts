/**
 * Sales Forecast Generation API Route
 * 
 * POST /api/forecast/generate
 * Generates sales forecasts using Flask XGBoost model
 * 
 * Workflow:
 * 1. Receives forecast parameters (start_date, periods)
 * 2. Validates input parameters
 * 3. Calls Flask API for XGBoost prediction
 * 4. Saves forecast results to Supabase
 * 5. Logs activity
 * 6. Returns forecast data with confidence intervals
 * 
 * Team: Sereno, Page, Dulce, Laudato
 * Teacher: Sir Charlston Sean Gono
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { predictSalesForecast } from '@/lib/flask-client'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Extract and validate parameters
    const { start_date, periods = 7, model = 'xgboost' } = data
    
    if (!start_date) {
      return NextResponse.json(
        { error: 'Missing required field: start_date' },
        { status: 400 }
      )
    }
    
    // Validate date format
    const startDate = new Date(start_date)
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }
    
    // Validate periods
    const periodsNum = Number(periods)
    if (isNaN(periodsNum) || periodsNum < 1 || periodsNum > 365) {
      return NextResponse.json(
        { error: 'Periods must be between 1 and 365 days' },
        { status: 400 }
      )
    }
    
    // Validate model choice (XGBoost only)
    if (model !== 'xgboost') {
      return NextResponse.json(
        { error: 'Only XGBoost model is supported for forecasting' },
        { status: 400 }
      )
    }
    
    console.log(`Calling Flask API for forecast: ${start_date}, ${periods} days, model: ${model}`)
    
    // Call Flask API
    const prediction = await predictSalesForecast({
      start_date,
      periods: periodsNum,
      model
    })
    
    if (!prediction.success || !prediction.data) {
      return NextResponse.json(
        { 
          error: 'Forecast prediction failed',
          message: prediction.error || 'Unknown error from Flask API'
        },
        { status: 500 }
      )
    }
    
    const forecastData = prediction.data
    
    // Save forecast to database
    console.log('Saving forecast results to database...')
    const forecastRecords = forecastData.forecast.map((f: any) => ({
      forecast_date: f.ds,
      predicted_amount: f.yhat,
      lower_bound: f.yhat_lower,
      upper_bound: f.yhat_upper,
      confidence_score: f.confidence,
      model_used: forecastData.model_used,
      forecast_period: periodsNum,
      generated_at: new Date().toISOString()
    }))
    
    const { data: savedForecasts, error: insertError } = await supabaseAdmin
      .from('sales_forecasts')
      .insert(forecastRecords)
      .select()
    
    if (insertError) {
      console.error('Failed to save forecasts:', insertError)
      // Continue even if save fails - return prediction anyway
    }
    
    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      activity_type: 'sales_forecast',
      activity_category: 'forecasting',
      description: `Generated ${periodsNum}-day forecast using ${forecastData.model_used}`,
      metadata: {
        start_date,
        periods: periodsNum,
        model: model,
        avg_daily_sales: forecastData.summary.avg_daily_sales,
        total_projected: forecastData.summary.total_projected,
        avg_confidence: forecastData.summary.avg_confidence
      }
    })
    
    // Update dashboard stats
    await supabaseAdmin.rpc('update_dashboard_stats')
    
    return NextResponse.json({
      success: true,
      forecast: forecastData.forecast,
      model_used: forecastData.model_used,
      summary: forecastData.summary,
      saved_to_database: savedForecasts && savedForecasts.length > 0,
      models_available: forecastData.models_available,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in forecast generation API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
