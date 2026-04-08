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
import { acquirers } from '@/lib/mock-data'

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'verified':
      return 'success'
    case 'pending':
      return 'warning'
    case 'disabled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default function AcquirersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const filteredAcquirers = acquirers.filter((acquirer) => {
    const matchesSearch = acquirer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acquirer.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || acquirer.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statuses = Array.from(new Set(acquirers.map(a => a.status)))

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Acquirers</h1>
            <p className="text-muted-foreground mt-2">Manage payment acquirer integrations</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Acquirer
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
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
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
              {(searchTerm || filterStatus) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
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
            <CardTitle>Bank Acquirers</CardTitle>
            <CardDescription>Showing {filteredAcquirers.length} of {acquirers.length} acquirers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Submerchants</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAcquirers.length > 0 ? (
                    filteredAcquirers.map((acquirer) => (
                      <TableRow key={acquirer.id}>
                        <TableCell className="font-medium">{acquirer.name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono">{acquirer.code}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(acquirer.status)}>
                            {acquirer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{acquirer.assignedSubmerchants}</TableCell>
                        <TableCell className="text-muted-foreground">{acquirer.createdAt}</TableCell>
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
                              <DropdownMenuItem>Edit Credentials</DropdownMenuItem>
                              <DropdownMenuItem>View Assignments</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Disable</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No acquirers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
