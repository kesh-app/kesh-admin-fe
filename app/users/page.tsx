'use client'

import { useState } from 'react'
import { Search, MoreHorizontal, Plus } from 'lucide-react'
import { MainLayout } from '@/components/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { users, type User } from '@/lib/mock-data'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !filterRole || user.role === filterRole
    const matchesStatus = !filterStatus || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const roles = Array.from(new Set(users.map(u => u.role)))
  const statuses = Array.from(new Set(users.map(u => u.status)))

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-2">Manage user accounts and permissions</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              {/* Search */}
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground block mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Role filter */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Role</label>
                <select
                  value={filterRole || ''}
                  onChange={(e) => setFilterRole(e.target.value || null)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                >
                  <option value="">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Status</label>
                <select
                  value={filterStatus || ''}
                  onChange={(e) => setFilterStatus(e.target.value || null)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              {(searchTerm || filterRole || filterStatus) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterRole(null)
                    setFilterStatus(null)
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>Showing {filteredUsers.length} of {users.length} users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Change Role</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Remove User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
