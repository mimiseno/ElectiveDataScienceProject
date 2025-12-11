"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const { user, logout, isAdmin } = useAuth()

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">{user?.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name}</span>
              {isAdmin && (
                <span className="hidden md:block px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                  Admin
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
            <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="text-foreground cursor-pointer">
              <Link href="/dashboard/profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-foreground cursor-pointer">
              <Link href="/dashboard/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
