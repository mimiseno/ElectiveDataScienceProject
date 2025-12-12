"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Users, UserCheck, UserPlus, Activity, Clock, AlertCircle } from "lucide-react"

interface DashboardStats {
  total_users: { value: number; change: number; trend: string }
  active_users: { value: number; change: number; trend: string }
  new_users_this_month: { value: number; change: number; trend: string }
  segments_analyzed_today: { value: number; change: number; trend: string }
  forecasts_generated_today: { value: number; change: number; trend: string }
  avg_session_time: { value: number; change: number; trend: string }
}

interface UserStats {
  total_users: number
  active_users: number
  inactive_users: number
  admin_users: number
  regular_users: number
  users_online_24h: number
  new_users_this_month: number
}

interface ActivityLog {
  id: string
  activity_type: string
  activity_category: string
  description: string
  created_at: string
  users?: {
    name: string
    email: string
    role: string
  }
}

interface MonthlyUserData {
  month: string
  monthKey: string
  activeUsers: number
  newUsers: number
  totalUsers: number
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [monthlyUsers, setMonthlyUsers] = useState<MonthlyUserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMockData, setIsMockData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await fetch('/api/stats/dashboard')
        const statsData = await statsResponse.json()

        if (statsData.success || statsData.mockData) {
          setStats(statsData.stats)
          setUserStats(statsData.userStats)
          setRecentActivity(statsData.recentActivity || [])
          setIsMockData(statsData.mockData || false)
          setError(null)
        } else {
          setError(statsData.message || 'Failed to fetch dashboard data')
        }

        // Fetch monthly users data
        const monthlyResponse = await fetch('/api/stats/monthly-users')
        const monthlyData = await monthlyResponse.json()

        if (monthlyData.success || monthlyData.mockData) {
          setMonthlyUsers(monthlyData.monthlyUsers || [])
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Unable to connect to server')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Format stat value for display
  const formatStatValue = (value: number, type: string): string => {
    if (type === 'avg_session_time') {
      return value > 0 ? `${Math.round(value)}m` : '--'
    }
    return value.toString()
  }

  // Format change for display
  const formatChange = (change: number): string => {
    if (change === 0) return '--'
    return `${change > 0 ? '+' : ''}${change}%`
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={`Welcome back, ${user?.name}`} description="System usage overview and analytics" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Database Connection Warning */}
        {isMockData && (
          <Card className="bg-warning/10 border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm font-medium text-foreground">Database Not Connected</p>
                  <p className="text-xs text-muted-foreground">
                    Configure Supabase environment variables to see real data. Check .env.example
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="bg-destructive/10 border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Now with real data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Users" 
            value={isLoading ? '--' : formatStatValue(stats?.total_users.value || 0, 'total_users')} 
            change={isLoading ? '--' : formatChange(stats?.total_users.change || 0)} 
            trend={(stats?.total_users.trend as any) || 'neutral'} 
            icon={Users} 
          />
          <StatCard 
            title="Active Users" 
            value={isLoading ? '--' : formatStatValue(stats?.active_users.value || 0, 'active_users')} 
            change={isLoading ? '--' : formatChange(stats?.active_users.change || 0)} 
            trend={(stats?.active_users.trend as any) || 'neutral'} 
            icon={UserCheck} 
          />
          <StatCard 
            title="New Users (Month)" 
            value={isLoading ? '--' : formatStatValue(stats?.new_users_this_month.value || 0, 'new_users')} 
            change={isLoading ? '--' : formatChange(stats?.new_users_this_month.change || 0)} 
            trend={(stats?.new_users_this_month.trend as any) || 'neutral'} 
            icon={UserPlus} 
          />
          <StatCard 
            title="Avg. Session Time" 
            value={isLoading ? '--' : formatStatValue(stats?.avg_session_time.value || 0, 'avg_session_time')} 
            change={isLoading ? '--' : formatChange(stats?.avg_session_time.change || 0)} 
            trend={(stats?.avg_session_time.trend as any) || 'neutral'} 
            icon={Clock} 
          />
        </div>

        {/* Users Per Month Chart */}
        <Card className="bg-card border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground">Monthly Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-pulse text-muted-foreground">Loading chart...</div>
              </div>
            ) : monthlyUsers.length > 0 && monthlyUsers.some(m => m.activeUsers > 0 || m.totalUsers > 0) ? (
              <div className="h-80">
                {/* Simple bar chart visualization */}
                <div className="flex items-end justify-between h-full gap-2 px-4">
                  {monthlyUsers.map((data, index) => {
                    const maxUsers = Math.max(...monthlyUsers.map(m => m.activeUsers))
                    const height = maxUsers > 0 ? (data.activeUsers / maxUsers) * 100 : 0
                    
                    return (
                      <div key={data.monthKey} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center justify-end h-64">
                          <div className="relative group w-full">
                            {/* Bar */}
                            <div 
                              className="w-full bg-chart-1 hover:bg-chart-1/80 transition-all rounded-t"
                              style={{ height: `${height}%`, minHeight: data.activeUsers > 0 ? '4px' : '0px' }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                              <div className="bg-popover border border-border rounded-lg p-3 shadow-lg whitespace-nowrap">
                                <p className="text-xs font-medium text-foreground">{data.month}</p>
                                <div className="mt-1 space-y-1">
                                  <p className="text-xs text-muted-foreground">
                                    Active: <span className="text-chart-1 font-medium">{data.activeUsers}</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    New: <span className="text-chart-2 font-medium">{data.newUsers}</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Total: <span className="text-foreground font-medium">{data.totalUsers}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-2 rotate-0 whitespace-nowrap">
                            {data.month.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-1 rounded" />
                    <span className="text-xs text-muted-foreground">Active Users</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isMockData 
                    ? 'Connect to database to view monthly user statistics' 
                    : 'No user activity data available yet'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isMockData 
                    ? 'This chart will display the number of users accessing the system each month'
                    : 'Data will appear here as users log in to the system'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Summary */}
          <Card className="bg-card border-0 shadow-none">
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
                    <span className="text-sm text-foreground">Users Online (24h)</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {isLoading ? '--' : (userStats?.users_online_24h || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-chart-2" />
                    </div>
                    <span className="text-sm text-foreground">Segments Analyzed Today</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {isLoading ? '--' : (stats?.segments_analyzed_today.value || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-chart-3/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-chart-3" />
                    </div>
                    <span className="text-sm text-foreground">Forecasts Generated Today</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {isLoading ? '--' : (stats?.forecasts_generated_today.value || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent System Activity */}
          <Card className="bg-card border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-foreground">Recent System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-pulse text-muted-foreground">Loading activity...</div>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-muted/20 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {activity.users?.name || 'System'}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Activity className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">No recent activity to display</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isMockData ? 'Connect database to see activity logs' : 'Activity will appear here as users interact with the system'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Notice */}
        {isAdmin && (
          <Card className="bg-primary/5 border-0 shadow-none">
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
