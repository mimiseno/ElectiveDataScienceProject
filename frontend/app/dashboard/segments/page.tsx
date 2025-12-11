"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, Users, TrendingUp, AlertTriangle, Crown, Heart, Upload, FileSpreadsheet, X } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const segmentInfo = {
  0: {
    name: "Loyal Customers",
    icon: Heart,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    chartColor: "var(--chart-2)",
    description: "High monetary value, moderate frequency. These customers make significant purchases.",
    recommendations: ["Offer exclusive loyalty rewards", "Early access to new products", "Personalized discount codes"],
  },
  1: {
    name: "Lost Customers",
    icon: AlertTriangle,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    chartColor: "var(--chart-5)",
    description: "High recency, low engagement. These customers haven't purchased in a while.",
    recommendations: [
      "Win-back email campaigns",
      "Special reactivation offers",
      "Feedback surveys to understand churn",
    ],
  },
  2: {
    name: "Champions",
    icon: Crown,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    chartColor: "var(--chart-1)",
    description: "Best frequency and spending. Your most valuable customers.",
    recommendations: [
      "VIP treatment and exclusive perks",
      "Referral program incentives",
      "First access to premium products",
    ],
  },
  3: {
    name: "At Risk",
    icon: TrendingUp,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    chartColor: "var(--chart-3)",
    description: "Recent but declining activity. Need attention before they churn.",
    recommendations: ["Re-engagement campaigns", "Personalized product recommendations", "Limited-time offers"],
  },
}

export default function SegmentsPage() {
  const [recency, setRecency] = useState("")
  const [frequency, setFrequency] = useState("")
  const [monetary, setMonetary] = useState("")
  const [result, setResult] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [datasetResults, setDatasetResults] = useState<any[] | null>(null)
  const [isProcessingDataset, setIsProcessingDataset] = useState(false)

  const handlePredict = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const r = Number.parseInt(recency)
    const f = Number.parseInt(frequency)
    const m = Number.parseFloat(monetary)

    let segment = 0
    if (r > 60) segment = 1
    else if (f >= 10 && m > 50000) segment = 2
    else if (r > 30 && f < 5) segment = 3

    setResult(segment)
    setIsLoading(false)
  }

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setDatasetResults(null)
    }
  }, [])

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setDatasetResults(null)
  }

  const handleProcessDataset = async () => {
    if (!uploadedFile) return

    setIsProcessingDataset(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated results from ML model processing
    setDatasetResults([
      { name: "Champions", value: 25, count: 125, color: "var(--chart-1)" },
      { name: "Loyal Customers", value: 30, count: 150, color: "var(--chart-2)" },
      { name: "At Risk", value: 28, count: 140, color: "var(--chart-3)" },
      { name: "Lost Customers", value: 17, count: 85, color: "var(--chart-5)" },
    ])
    setIsProcessingDataset(false)
  }

  const segment = result !== null ? segmentInfo[result as keyof typeof segmentInfo] : null
  const totalCustomers = datasetResults?.reduce((sum, d) => sum + d.count, 0) || 0

  return (
    <div className="flex flex-col h-full">
      <Header title="Customer Segmentation" description="ML-powered RFM analysis using K-Means clustering" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Customer Dataset
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Upload a CSV file containing customer RFM data for bulk segmentation analysis
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
                    id="dataset-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="dataset-upload" className="cursor-pointer">
                      Select File
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Required columns: customer_id, recency, frequency, monetary
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
                    <Button onClick={handleProcessDataset} disabled={isProcessingDataset}>
                      {isProcessingDataset ? "Processing..." : "Analyze Dataset"}
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

        {datasetResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Customer Segments Distribution</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {totalCustomers} customers analyzed from your dataset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datasetResults}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {datasetResults.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--foreground)",
                        }}
                        formatter={(value: number, name: string, props: any) => [
                          `${props.payload.count} customers (${value}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {datasetResults.map((segment) => (
                    <div key={segment.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                      <span className="text-sm text-muted-foreground">{segment.name}</span>
                      <span className="text-sm font-medium text-foreground ml-auto">{segment.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Segment Insights</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Key findings from your customer analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {datasetResults.map((seg) => {
                  const info = Object.values(segmentInfo).find((s) => s.chartColor === seg.color)
                  return (
                    <div key={seg.name} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                        <span className="text-sm font-medium text-foreground">{seg.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{seg.value}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {info?.recommendations[0] || "Review customer engagement strategies"}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Single Customer Analysis Input Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Single Customer Analysis
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter individual customer metrics to predict their segment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recency" className="text-foreground">
                  Recency (days since last purchase)
                </Label>
                <Input
                  id="recency"
                  type="number"
                  placeholder="e.g., 30"
                  value={recency}
                  onChange={(e) => setRecency(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">Range: 1-365 days</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-foreground">
                  Frequency (total number of orders)
                </Label>
                <Input
                  id="frequency"
                  type="number"
                  placeholder="e.g., 5"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">Range: 1-100 orders</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monetary" className="text-foreground">
                  Monetary (total spend in PHP)
                </Label>
                <Input
                  id="monetary"
                  type="number"
                  placeholder="e.g., 15000"
                  value={monetary}
                  onChange={(e) => setMonetary(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <Button
                onClick={handlePredict}
                disabled={!recency || !frequency || !monetary || isLoading}
                className="w-full"
              >
                {isLoading ? "Analyzing..." : "Predict Segment"}
              </Button>
            </CardContent>
          </Card>

          {/* Single Customer Result */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Prediction Result</CardTitle>
              <CardDescription className="text-muted-foreground">
                Customer segment classification and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {segment ? (
                <div className="space-y-6">
                  <div className={`p-6 rounded-lg ${segment.bgColor}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <segment.icon className={`w-8 h-8 ${segment.color}`} />
                      <div>
                        <h3 className={`text-xl font-bold ${segment.color}`}>{segment.name}</h3>
                        <p className="text-sm text-muted-foreground">Cluster {result}</p>
                      </div>
                    </div>
                    <p className="text-foreground">{segment.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {segment.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Enter customer data and click predict to see the segment analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Segment Overview */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">All Customer Segments</CardTitle>
            <CardDescription className="text-muted-foreground">
              Overview of the K-Means clustering segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(segmentInfo).map(([key, info]) => (
                <div key={key} className={`p-4 rounded-lg border border-border ${info.bgColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <info.icon className={`w-5 h-5 ${info.color}`} />
                    <span className={`font-medium ${info.color}`}>{info.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
