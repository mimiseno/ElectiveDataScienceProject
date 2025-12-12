"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Server, Activity, Settings, Lock, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface SystemStatus {
  apiHealth: { value: string; status: "healthy" | "error" | "loading" };
  databaseStatus: { value: string; status: "healthy" | "error" | "loading" };
  modelServer: { value: string; status: "healthy" | "error" | "loading" };
  modelsLoaded: {
    kmeans: boolean;
    prophet: boolean;
    xgboost: boolean;
    rfm_scaler: boolean;
  };
}

interface ModelInfo {
  name: string;
  loaded: boolean;
  description: string;
}

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    apiHealth: { value: "Checking...", status: "loading" },
    databaseStatus: { value: "Checking...", status: "loading" },
    modelServer: { value: "Checking...", status: "loading" },
    modelsLoaded: { kmeans: false, prophet: false, xgboost: false, rfm_scaler: false }
  })
  const [models, setModels] = useState<ModelInfo[]>([])
  const [lastChecked, setLastChecked] = useState<string>("")

  const checkSystemStatus = useCallback(async () => {
    setRefreshing(true)
    
    // Check Flask API health
    let apiStatus: SystemStatus["apiHealth"] = { value: "Offline", status: "error" }
    let modelStatus: SystemStatus["modelServer"] = { value: "Offline", status: "error" }
    let modelsLoaded = { kmeans: false, prophet: false, xgboost: false, rfm_scaler: false }
    let modelsList: ModelInfo[] = []
    
    try {
      const healthRes = await fetch("http://localhost:5000/health", { 
        method: "GET",
        signal: AbortSignal.timeout(5000)
      })
      
      if (healthRes.ok) {
        const healthData = await healthRes.json()
        apiStatus = { value: "Operational", status: "healthy" }
        modelsLoaded = healthData.models_loaded || modelsLoaded
        
        // Check if all models are loaded
        const allLoaded = modelsLoaded.kmeans && modelsLoaded.prophet && modelsLoaded.xgboost
        modelStatus = allLoaded 
          ? { value: "All Models Loaded", status: "healthy" }
          : { value: "Some Models Missing", status: "error" }
      }
    } catch (error) {
      console.error("API health check failed:", error)
      apiStatus = { value: "Connection Failed", status: "error" }
      modelStatus = { value: "Unavailable", status: "error" }
    }

    // Get model info
    try {
      const modelsRes = await fetch("http://localhost:5000/models/info", {
        method: "GET",
        signal: AbortSignal.timeout(5000)
      })
      
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json()
        modelsList = [
          { 
            name: "K-Means Segmentation", 
            loaded: modelsData.kmeans_model?.loaded || false,
            description: modelsData.kmeans_model?.description || "Customer segmentation"
          },
          { 
            name: "Prophet Forecasting", 
            loaded: modelsData.prophet_model?.loaded || false,
            description: modelsData.prophet_model?.description || "Time-series forecasting"
          },
          { 
            name: "XGBoost Ensemble", 
            loaded: modelsData.xgboost_model?.loaded || false,
            description: modelsData.xgboost_model?.description || "Gradient boosting predictions"
          },
          { 
            name: "RFM Scaler", 
            loaded: modelsData.rfm_scaler?.loaded || false,
            description: modelsData.rfm_scaler?.description || "Feature normalization"
          }
        ]
      }
    } catch (error) {
      console.error("Models info fetch failed:", error)
    }

    // Check Supabase database connection
    let dbStatus: SystemStatus["databaseStatus"] = { value: "Disconnected", status: "error" }
    try {
      const { data, error } = await supabase.from("users").select("id").limit(1)
      if (!error) {
        dbStatus = { value: "Connected", status: "healthy" }
      } else {
        dbStatus = { value: "Connection Error", status: "error" }
      }
    } catch (error) {
      console.error("Database check failed:", error)
      dbStatus = { value: "Connection Failed", status: "error" }
    }

    setSystemStatus({
      apiHealth: apiStatus,
      databaseStatus: dbStatus,
      modelServer: modelStatus,
      modelsLoaded
    })
    setModels(modelsList)
    setLastChecked(new Date().toLocaleTimeString())
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }
    
    checkSystemStatus()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000)
    return () => clearInterval(interval)
  }, [isAdmin, router, checkSystemStatus])

  if (!isAdmin) {
    return null
  }

  const systemMetrics = [
    { name: "Flask API", value: systemStatus.apiHealth.value, status: systemStatus.apiHealth.status },
    { name: "Database", value: systemStatus.databaseStatus.value, status: systemStatus.databaseStatus.status },
    { name: "ML Models", value: systemStatus.modelServer.value, status: systemStatus.modelServer.status },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Admin Panel" description="System configuration and monitoring" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* System Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  System Status
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Real-time system health monitoring {lastChecked && `• Last checked: ${lastChecked}`}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkSystemStatus}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Checking system status...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.name} className="p-4 bg-muted/20 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{metric.name}</span>
                      {metric.status === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : metric.status === "healthy" ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <p className={`font-medium ${
                      metric.status === "healthy" ? "text-success" : 
                      metric.status === "error" ? "text-destructive" : "text-foreground"
                    }`}>
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ML Models */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                ML Models Status
              </CardTitle>
              <CardDescription className="text-muted-foreground">Pre-trained model availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : models.length > 0 ? (
                models.map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      model.loaded 
                        ? "bg-success/20 text-success" 
                        : "bg-destructive/20 text-destructive"
                    }`}>
                      {model.loaded ? "Loaded" : "Not Loaded"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Unable to fetch model information</p>
                  <p className="text-xs">Make sure Flask API is running</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-muted-foreground">Administrative operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 bg-transparent"
                onClick={checkSystemStatus}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh System Status
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 bg-transparent"
                onClick={() => router.push("/dashboard/users")}
              >
                <Database className="w-4 h-4" />
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 bg-transparent"
                onClick={() => router.push("/dashboard/segments")}
              >
                <Activity className="w-4 h-4" />
                Customer Segmentation
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 bg-transparent"
                onClick={() => router.push("/dashboard/forecast")}
              >
                <Server className="w-4 h-4" />
                Sales Forecasting
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              System Information
            </CardTitle>
            <CardDescription className="text-muted-foreground">Current system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/20 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Flask API Endpoint</p>
                <p className="text-foreground font-mono text-sm">http://localhost:5000</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Database Provider</p>
                <p className="text-foreground font-mono text-sm">Supabase (PostgreSQL)</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">ML Framework</p>
                <p className="text-foreground font-mono text-sm">Prophet + XGBoost + K-Means</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Training Dataset</p>
                <p className="text-foreground font-mono text-sm">Olist E-commerce (Brazil)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              API Configuration
            </CardTitle>
            <CardDescription className="text-muted-foreground">Endpoint settings and rate limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Endpoint</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rate Limit</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground font-mono">/predict/segment</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">POST</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">100/min</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-success/20 text-success rounded-full">Active</span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground font-mono">/predict/forecast</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">POST</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">50/min</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-success/20 text-success rounded-full">Active</span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground font-mono">/health</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">GET</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">Unlimited</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-success/20 text-success rounded-full">Active</span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground font-mono">/models/info</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">GET</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">200/min</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-success/20 text-success rounded-full">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
