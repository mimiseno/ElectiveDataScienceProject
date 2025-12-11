"use client"

import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Users, UserCheck, UserPlus, Activity, Clock } from "lucide-react"

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <Header title={`Welcome back, ${user?.name}`} description="System usage overview and analytics" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Grid - Now focused on system users */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value="--" change="--" trend="up" icon={Users} />
          <StatCard title="Active Users" value="--" change="--" trend="up" icon={UserCheck} />
          <StatCard title="New Users (Month)" value="--" change="--" trend="up" icon={UserPlus} />
          <StatCard title="Avg. Session Time" value="--" change="--" trend="up" icon={Clock} />
        </div>

        {/* Users Per Month Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Monthly Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Connect to a database to view monthly user statistics</p>
              <p className="text-sm text-muted-foreground mt-2">
                This chart will display the number of users accessing the system each month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">User Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-chart-1/10 flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-chart-1" />
                    </div>
                    <span className="text-sm text-foreground">Users Online Now</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">--</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-chart-2" />
                    </div>
                    <span className="text-sm text-foreground">Segments Analyzed Today</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">--</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-chart-3/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-chart-3" />
                    </div>
                    <span className="text-sm text-foreground">Forecasts Generated Today</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">--</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent System Activity */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Activity className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No recent activity to display</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Activity logs will appear here when connected to a database
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Notice */}
        {isAdmin && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Admin Access Enabled</p>
                  <p className="text-xs text-muted-foreground">
                    You have access to User Management and Admin Panel features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
