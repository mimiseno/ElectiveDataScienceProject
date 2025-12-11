"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Users,
  TrendingUp,
  Target,
  Settings,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { name: "Customer Segments", href: "/dashboard/segments", icon: Target, adminOnly: false },
  { name: "Sales Forecast", href: "/dashboard/forecast", icon: TrendingUp, adminOnly: false },
  { name: "User Management", href: "/dashboard/users", icon: Users, adminOnly: true },
  { name: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck, adminOnly: true },
]

const bottomNavigation = [
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const filteredNavigation = navigation.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sidebar-foreground">Analytix</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          )
        })}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        {/* User info */}
        {!collapsed && user && (
          <div className="mt-4 p-3 bg-sidebar-accent/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
