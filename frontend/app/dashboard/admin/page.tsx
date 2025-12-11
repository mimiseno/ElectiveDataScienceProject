"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Database, Server, Activity, Settings, Lock, RefreshCw, Download, Upload } from "lucide-react"

const systemMetrics = [
  { name: "API Health", value: "Operational", status: "healthy" },
  { name: "Database Status", value: "Connected", status: "healthy" },
  { name: "Model Server", value: "Running", status: "healthy" },
  { name: "Cache Status", value: "Active", status: "healthy" },
]

const modelInfo = [
  { name: "K-Means Segmentation", version: "1.3.2", lastTrained: "2024-12-15" },
  { name: "Prophet Forecasting", version: "1.1.5", lastTrained: "2024-12-10" },
  { name: "XGBoost Ensemble", version: "2.0.3", lastTrained: "2024-12-12" },
]

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, router])

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Admin Panel" description="System configuration and monitoring" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* System Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription className="text-muted-foreground">Real-time system health monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemMetrics.map((metric) => (
                <div key={metric.name} className="p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{metric.name}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        metric.status === "healthy" ? "bg-success" : "bg-destructive"
                      }`}
                    />
                  </div>
                  <p className="text-foreground font-medium">{metric.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ML Models */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                ML Models
              </CardTitle>
              <CardDescription className="text-muted-foreground">Model versions and training info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {modelInfo.map((model) => (
                <div
                  key={model.name}
                  className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{model.name}</p>
                    <p className="text-xs text-muted-foreground">
                      v{model.version} - Trained: {model.lastTrained}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <RefreshCw className="w-3 h-3" />
                    Retrain
                  </Button>
                </div>
              ))}
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
              <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                <Download className="w-4 h-4" />
                Export All Data
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                <Upload className="w-4 h-4" />
                Import Dataset
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                Refresh Cache
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                <Database className="w-4 h-4" />
                Database Backup
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              System Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">Configure system behavior and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Enable API Rate Limiting</Label>
                <p className="text-xs text-muted-foreground">Limit API requests per user</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Automatic Model Retraining</Label>
                <p className="text-xs text-muted-foreground">Retrain models on new data weekly</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Send alerts for system events</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Disable public access during updates</p>
              </div>
              <Switch />
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
