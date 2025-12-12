"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Shield, Calendar, Save } from "lucide-react"

export default function ProfilePage() {
  const { user, isAdmin } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  return (
    <div className="flex flex-col h-full">
      <Header title="Profile" description="Manage your account settings" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-card border-0 shadow-none">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">{user?.name.charAt(0).toUpperCase()}</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      isAdmin ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isAdmin && <Shield className="w-3 h-3 inline mr-1" />}
                    {user?.role}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card className="lg:col-span-2 bg-card border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-foreground">Edit Profile</CardTitle>
              <CardDescription className="text-muted-foreground">Update your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 bg-input border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-input border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="bg-card border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground">Account Information</CardTitle>
            <CardDescription className="text-muted-foreground">Your account details and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Account ID</span>
                </div>
                <p className="text-foreground font-medium">{user?.id}</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Role</span>
                </div>
                <p className="text-foreground font-medium capitalize">{user?.role}</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Member Since</span>
                </div>
                <p className="text-foreground font-medium">January 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="bg-card border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground">Permissions</CardTitle>
            <CardDescription className="text-muted-foreground">Your access level and capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm text-foreground">View Dashboard</span>
                <span className="text-xs text-success">Allowed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm text-foreground">Customer Segmentation</span>
                <span className="text-xs text-success">Allowed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm text-foreground">Sales Forecasting</span>
                <span className="text-xs text-success">Allowed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm text-foreground">Analytics</span>
                <span className="text-xs text-success">Allowed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm text-foreground">User Management</span>
                <span className={`text-xs ${isAdmin ? "text-success" : "text-destructive"}`}>
                  {isAdmin ? "Allowed" : "Denied"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm text-foreground">Admin Panel</span>
                <span className={`text-xs ${isAdmin ? "text-success" : "text-destructive"}`}>
                  {isAdmin ? "Allowed" : "Denied"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
