"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Search, MoreVertical, Shield, User, Mail, Edit, Trash2, UserPlus } from "lucide-react"
import { useEffect } from "react"

const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@analytix.com",
    role: "admin",
    status: "active",
    lastLogin: "2025-01-10",
    createdAt: "2024-06-15",
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@analytix.com",
    role: "user",
    status: "active",
    lastLogin: "2025-01-09",
    createdAt: "2024-08-20",
  },
  {
    id: "3",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "user",
    status: "active",
    lastLogin: "2025-01-08",
    createdAt: "2024-09-10",
  },
  {
    id: "4",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "user",
    status: "inactive",
    lastLogin: "2024-12-15",
    createdAt: "2024-07-22",
  },
  {
    id: "5",
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    role: "user",
    status: "active",
    lastLogin: "2025-01-10",
    createdAt: "2024-10-05",
  },
]

export default function UsersPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [users] = useState(mockUsers)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, router])

  if (!isAdmin) {
    return null
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full">
      <Header title="User Management" description="Manage system users and their permissions" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {users.filter((u) => u.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{users.filter((u) => u.role === "admin").length}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {users.filter((u) => u.status === "inactive").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">All Users</CardTitle>
                <CardDescription className="text-muted-foreground">View and manage user accounts</CardDescription>
              </div>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Login</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.role === "admin" && <Shield className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === "active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem className="text-foreground cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-foreground cursor-pointer">
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
