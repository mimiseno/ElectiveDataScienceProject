"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, MoreVertical, Shield, User, Mail, Edit, Trash2, UserPlus, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  last_login_at: string | null
  created_at: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  adminUsers: number
  regularUsers: number
  newUsersThisMonth: number
}

export default function UsersPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<UserData[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  })
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch users and stats
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/users/stats')
      ])

      if (!usersRes.ok) {
        throw new Error('Failed to fetch users')
      }
      if (!statsRes.ok) {
        throw new Error('Failed to fetch stats')
      }

      const usersData = await usersRes.json()
      const statsData = await statsRes.json()

      setUsers(usersData.users || [])
      setStats(statsData.stats || null)
    } catch (err: any) {
      setError(err.message || 'Failed to load user data')
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to load user data'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }
    fetchData()
  }, [isAdmin, router])

  // Handle edit user
  const handleEdit = (user: UserData) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    })
    setEditDialogOpen(true)
  }

  // Handle delete user
  const handleDelete = (user: UserData) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  // Submit edit
  const handleEditSubmit = async () => {
    if (!selectedUser) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      toast({
        title: "Success",
        description: "User updated successfully"
      })

      setEditDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Submit delete
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      toast({
        title: "Success",
        description: "User deleted successfully"
      })

      setDeleteDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message
      })
    } finally {
      setActionLoading(false)
    }
  }

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
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </>
                  )}
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
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-foreground">{stats?.activeUsers || 0}</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </>
                  )}
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
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-foreground">{stats?.adminUsers || 0}</p>
                      <p className="text-sm text-muted-foreground">Admins</p>
                    </>
                  )}
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
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-foreground">{stats?.inactiveUsers || 0}</p>
                      <p className="text-sm text-muted-foreground">Inactive</p>
                    </>
                  )}
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

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No users found
              </div>
            ) : (
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
                          {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem 
                                onClick={() => handleEdit(user)}
                                className="text-foreground cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(user)}
                                className="text-destructive cursor-pointer"
                              >
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={editForm.role} onValueChange={(value: 'admin' | 'user') => setEditForm({...editForm, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={editForm.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setEditForm({...editForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
