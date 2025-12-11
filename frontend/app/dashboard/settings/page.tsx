"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Lock, Eye, EyeOff, Globe, Moon, Save } from "lucide-react"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" description="Manage your preferences and security" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Notifications */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription className="text-muted-foreground">Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive email alerts for important updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Forecast Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified when forecasts are ready</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Segment Changes</Label>
                <p className="text-xs text-muted-foreground">Alert when customer segments shift significantly</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Weekly Reports</Label>
                <p className="text-xs text-muted-foreground">Receive weekly analytics summaries</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Display Preferences
            </CardTitle>
            <CardDescription className="text-muted-foreground">Customize your visual experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Use dark theme throughout the app</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Compact View</Label>
                <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Show Chart Animations</Label>
                <p className="text-xs text-muted-foreground">Enable smooth chart transitions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Regional Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">Currency and locale preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Display Currency</Label>
                <select className="w-full h-10 px-3 rounded-md bg-input border border-border text-foreground">
                  <option value="PHP">Philippine Peso (PHP)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="BRL">Brazilian Real (BRL)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Date Format</Label>
                <select className="w-full h-10 px-3 rounded-md bg-input border border-border text-foreground">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Model predictions are converted from BRL at rate 1 BRL = 10.5 PHP
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription className="text-muted-foreground">Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-foreground">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10 bg-input border-border text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
