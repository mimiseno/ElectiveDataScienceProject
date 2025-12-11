"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Calendar, DollarSign, ArrowUp, ArrowDown, Upload, FileSpreadsheet, X } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Line } from "recharts"

export default function ForecastPage() {
  const [startDate, setStartDate] = useState("")
  const [periods, setPeriods] = useState("7")
  const [forecast, setForecast] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [salesData, setSalesData] = useState<any[] | null>(null)
  const [isProcessingSales, setIsProcessingSales] = useState(false)

  const handleForecast = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const start = new Date(startDate)
    const mockForecast = Array.from({ length: Number.parseInt(periods) }, (_, i) => {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      const baseValue = 50000 + Math.random() * 30000
      const trend = i * 500
      const seasonal = Math.sin((i / 7) * Math.PI) * 5000
      const predicted = baseValue + trend + seasonal

      return {
        date: date.toISOString().split("T")[0],
        predicted: Math.round(predicted),
        lower: Math.round(predicted * 0.85),
        upper: Math.round(predicted * 1.15),
      }
    })

    setForecast(mockForecast)
    setIsLoading(false)
  }

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setSalesData(null)
    }
  }, [])

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setSalesData(null)
  }

  const handleProcessSales = async () => {
    if (!uploadedFile) return

    setIsProcessingSales(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated historical sales data
    setSalesData([
      { month: "Jan", sales: 45000, orders: 180 },
      { month: "Feb", sales: 52000, orders: 210 },
      { month: "Mar", sales: 48000, orders: 195 },
      { month: "Apr", sales: 61000, orders: 245 },
      { month: "May", sales: 55000, orders: 220 },
      { month: "Jun", sales: 67000, orders: 270 },
      { month: "Jul", sales: 72000, orders: 290 },
      { month: "Aug", sales: 69000, orders: 275 },
      { month: "Sep", sales: 78000, orders: 310 },
      { month: "Oct", sales: 85000, orders: 340 },
      { month: "Nov", sales: 92000, orders: 370 },
      { month: "Dec", sales: 98000, orders: 395 },
    ])
    setIsProcessingSales(false)
  }

  const totalPredicted = forecast?.reduce((sum, d) => sum + d.predicted, 0) || 0
  const avgDaily = forecast ? totalPredicted / forecast.length : 0
  const totalSales = salesData?.reduce((sum, d) => sum + d.sales, 0) || 0
  const avgMonthlySales = salesData ? totalSales / salesData.length : 0

  return (
    <div className="flex flex-col h-full">
      <Header title="Sales Forecasting" description="Prophet + XGBoost ensemble model predictions" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <Card className="bg-card border-border">
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
                    Required columns: date, sales_amount, order_count
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

        {salesData && (
          <>
            {/* Sales Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-chart-1" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground">PHP {totalSales.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Monthly Sales</p>
                      <p className="text-2xl font-bold text-foreground">
                        PHP {Math.round(avgMonthlySales).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data Period</p>
                      <p className="text-2xl font-bold text-foreground">{salesData.length} months</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Overview Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Sales Overview</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Historical sales performance from your uploaded dataset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
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
                        formatter={(value: number) => [`PHP ${value.toLocaleString()}`, "Sales"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="var(--chart-1)"
                        fill="url(#salesGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forecast Input Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Forecast Parameters
              </CardTitle>
              <CardDescription className="text-muted-foreground">Configure the prediction timeframe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-foreground">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
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
                />
                <p className="text-xs text-muted-foreground">Range: 1-90 days</p>
              </div>

              <Button onClick={handleForecast} disabled={!startDate || !periods || isLoading} className="w-full">
                {isLoading ? "Generating Forecast..." : "Generate Forecast"}
              </Button>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Model Info</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Prophet: 60% weight (seasonality)</p>
                  <p>XGBoost: 40% weight (patterns)</p>
                  <p>Training data: Olist 2016-2018</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Chart */}
          <Card className="lg:col-span-2 bg-card border-border">
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
                  <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Configure parameters and generate a forecast to see predictions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Forecast Summary Stats */}
        {forecast && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Predicted</p>
                    <p className="text-2xl font-bold text-foreground">PHP {totalPredicted.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Average</p>
                    <p className="text-2xl font-bold text-foreground">PHP {Math.round(avgDaily).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Forecast Period</p>
                    <p className="text-2xl font-bold text-foreground">{forecast.length} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Forecast Table */}
        {forecast && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Daily Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
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
                        <tr key={row.date} className="border-b border-border/50">
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
