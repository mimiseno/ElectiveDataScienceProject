"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Calendar, DollarSign, ArrowUp, ArrowDown, Upload, FileSpreadsheet, X, AlertCircle, Lock, CheckCircle2 } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Line } from "recharts"

interface ForecastResult {
  ds: string
  yhat: number
  yhat_lower: number
  yhat_upper: number
  confidence: number
}

interface ForecastChartData {
  date: string
  predicted: number
  lower: number
  upper: number
  confidence: number
}

interface ForecastSummary {
  avg_daily_sales: number
  total_projected: number
  avg_confidence: number
  uncertainty_range: string
  periods: number
  start_date: string
  model_used?: string
}

interface SalesSummary {
  total_sales: number
  total_orders: number
  avg_daily_sales: number
  avg_order_value: number
  date_range: {
    start: string
    end: string
    days: number
  }
}

export default function ForecastPage() {
  const [startDate, setStartDate] = useState("")
  const [periods, setPeriods] = useState("7")
  const [forecast, setForecast] = useState<ForecastChartData[] | null>(null)
  const [forecastSummary, setForecastSummary] = useState<ForecastSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null)
  const [isProcessingSales, setIsProcessingSales] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Workflow: Forecast is only enabled after sales data is uploaded
  const isDataUploaded = salesSummary !== null
  
  // Minimum date for forecast (day after last data point)
  const [minForecastDate, setMinForecastDate] = useState<string>("")
  
  // Auto-set forecast start date to day after last data point
  useEffect(() => {
    if (salesSummary?.date_range?.end) {
      const endDate = new Date(salesSummary.date_range.end)
      endDate.setDate(endDate.getDate() + 1) // Day after last data point
      const minDate = endDate.toISOString().split('T')[0]
      setMinForecastDate(minDate)
      setStartDate(minDate)
    }
  }, [salesSummary])

  const handleForecast = async () => {
    setIsLoading(true)
    setForecastError(null)
    
    // Validate start date is after uploaded data
    if (minForecastDate && startDate < minForecastDate) {
      setForecastError(`Start date must be on or after ${minForecastDate} (after your uploaded data ends)`)
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/forecast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: startDate,
          periods: Number(periods),
          model: 'xgboost'
        })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        setForecastError(data.error || 'Failed to generate forecast')
        setForecast(null)
        setForecastSummary(null)
        return
      }
      
      // Map API response to chart format
      const forecastData = data.forecast.map((f: ForecastResult) => ({
        date: f.ds,
        predicted: Math.round(f.yhat),
        lower: Math.round(f.yhat_lower),
        upper: Math.round(f.yhat_upper),
        confidence: f.confidence
      }))
      
      setForecast(forecastData)
      setForecastSummary(data.summary)
      
    } catch (error) {
      console.error('Forecast error:', error)
      setForecastError(error instanceof Error ? error.message : 'Network error')
      setForecast(null)
      setForecastSummary(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setSalesSummary(null)
      setForecast(null)
      setForecastSummary(null)
      setUploadError(null)
    }
  }, [])

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setSalesSummary(null)
    setForecast(null)
    setForecastSummary(null)
    setStartDate("")
  }

  const handleProcessSales = async () => {
    if (!uploadedFile) return

    setIsProcessingSales(true)
    setUploadError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      
      const response = await fetch('/api/sales/bulk-upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        setUploadError(data.error || 'Failed to process sales data')
        setSalesSummary(null)
        return
      }
      
      setSalesSummary(data.summary)
      
    } catch (error) {
      console.error('Sales upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Network error')
      setSalesSummary(null)
    } finally {
      setIsProcessingSales(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Sales Forecasting" description="XGBoost ML-powered sales predictions" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <Card className="bg-card border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Sales Dataset
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Upload a CSV file containing your historical sales data for analysis and forecasting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="sales-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="sales-upload" className="cursor-pointer">
                      Select File
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supported formats: (1) date, sales_amount, order_count OR (2) InvoiceNo, Quantity, InvoiceDate, UnitPrice
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleProcessSales} disabled={isProcessingSales}>
                      {isProcessingSales ? "Processing..." : "Analyze Sales Data"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Error Display */}
        {uploadError && (
          <Card className="bg-destructive/10 border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">Upload Failed</p>
                  <p className="text-sm text-destructive/80">{uploadError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {salesSummary && (
          <>
            {/* Sales Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-chart-1" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground">PHP {salesSummary.total_sales.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Daily Sales</p>
                      <p className="text-2xl font-bold text-foreground">
                        PHP {salesSummary.avg_daily_sales.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data Period</p>
                      <p className="text-2xl font-bold text-foreground">{salesSummary.date_range.days} days</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {salesSummary.date_range.start} to {salesSummary.date_range.end}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold text-foreground">{salesSummary.total_orders.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: PHP {salesSummary.avg_order_value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forecast Input Form */}
          <Card className={`bg-card border-0 shadow-none ${!isDataUploaded ? 'opacity-60' : ''}`}>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                {isDataUploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
                Forecast Parameters
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isDataUploaded 
                  ? `Forecast based on ${salesSummary?.date_range.days} days of uploaded data`
                  : "Upload sales data first to enable forecasting"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isDataUploaded && (
                <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-border text-center">
                  <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload and analyze your sales CSV file above to unlock forecasting
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-foreground">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  min={minForecastDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-input border-border text-foreground"
                  disabled={!isDataUploaded}
                />
                {isDataUploaded && salesSummary && (
                  <p className="text-xs text-muted-foreground">
                    Your data ends on {salesSummary.date_range.end}. Forecast must start from {minForecastDate} or later.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="periods" className="text-foreground">
                  Forecast Periods (days)
                </Label>
                <Input
                  id="periods"
                  type="number"
                  min="1"
                  max="90"
                  value={periods}
                  onChange={(e) => setPeriods(e.target.value)}
                  className="bg-input border-border text-foreground"
                  disabled={!isDataUploaded}
                />
                <p className="text-xs text-muted-foreground">Range: 1-90 days</p>
              </div>

              <Button 
                onClick={handleForecast} 
                disabled={!isDataUploaded || !startDate || !periods || isLoading} 
                className="w-full"
              >
                {isLoading ? "Generating Forecast..." : "Generate Forecast"}
              </Button>

              {forecastError && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive">{forecastError}</p>
                </div>
              )}

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Model Info</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>XGBoost: Gradient Boosting</p>
                  <p>Features: Lag, Rolling Stats, Seasonality</p>
                  <p>Training data: Olist 2016-2018</p>
                  {forecastSummary && (
                    <p className="text-chart-1 mt-2">Model: {forecastSummary.model_used || 'XGBoost'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Chart */}
          <Card className="lg:col-span-2 bg-card border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-foreground">Forecast Visualization</CardTitle>
              <CardDescription className="text-muted-foreground">
                Predicted daily sales with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forecast ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast}>
                      <defs>
                        <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="date"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--foreground)",
                        }}
                        formatter={(value: number) => [`PHP ${value.toLocaleString()}`, ""]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#confidenceGradient)" />
                      <Area type="monotone" dataKey="lower" stroke="transparent" fill="var(--background)" />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        dot={{ fill: "var(--chart-1)", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-center">
                  {!isDataUploaded ? (
                    <>
                      <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground font-medium mb-2">
                        Step 1: Upload Your Sales Data
                      </p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Upload a CSV file with your historical sales data above. 
                        The AI model will analyze your data patterns to generate accurate forecasts.
                      </p>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-12 h-12 text-primary mb-4" />
                      <p className="text-foreground font-medium mb-2">
                        Step 2: Generate Your Forecast
                      </p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Your sales data is ready! Configure the forecast parameters on the left 
                        and click "Generate Forecast" to see predictions.
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Forecast Summary Stats */}
        {forecast && forecastSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-0 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Predicted</p>
                    <p className="text-2xl font-bold text-foreground">PHP {forecastSummary.total_projected.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Average</p>
                    <p className="text-2xl font-bold text-foreground">PHP {Math.round(forecastSummary.avg_daily_sales).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Forecast Period</p>
                    <p className="text-2xl font-bold text-foreground">{forecastSummary.periods} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                    <p className="text-2xl font-bold text-foreground">{forecastSummary.avg_confidence.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{forecastSummary.uncertainty_range}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Forecast Table */}
        {forecast && (
          <Card className="bg-card border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-foreground">Daily Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Predicted</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Lower Bound</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Upper Bound</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((row, i) => {
                      const prevPredicted = i > 0 ? forecast[i - 1].predicted : row.predicted
                      const trend = ((row.predicted - prevPredicted) / prevPredicted) * 100
                      return (
                        <tr key={row.date} className="">
                          <td className="py-3 px-4 text-sm text-foreground">
                            {new Date(row.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground text-right font-medium">
                            PHP {row.predicted.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground text-right">
                            PHP {row.lower.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground text-right">
                            PHP {row.upper.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            <span
                              className={`inline-flex items-center gap-1 ${trend >= 0 ? "text-success" : "text-destructive"}`}
                            >
                              {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                              {Math.abs(trend).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
