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
import { submerchants } from '@/lib/mock-data'

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

export default function SubmerchantPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const filteredSubmerchants = submerchants.filter((submerchant) => {
    const matchesSearch = submerchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submerchant.merchantId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || submerchant.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statuses = Array.from(new Set(submerchants.map(s => s.status)))

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Submerchants</h1>
            <p className="text-muted-foreground mt-2">Manage merchant accounts and integrations</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Submerchant
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
                    placeholder="Search by name or merchant ID..."
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
            <CardTitle>Merchants</CardTitle>
            <CardDescription>Showing {filteredSubmerchants.length} of {submerchants.length} submerchants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Merchant ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acquirers</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmerchants.length > 0 ? (
                    filteredSubmerchants.map((submerchant) => (
                      <TableRow key={submerchant.id}>
                        <TableCell className="font-medium">{submerchant.name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono">{submerchant.merchantId}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(submerchant.status)}>
                            {submerchant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {submerchant.acquirers.length > 0 ? (
                              submerchant.acquirers.map(acq => (
                                <Badge key={acq} variant="secondary" className="text-xs">
                                  {acq}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No acquirers</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{submerchant.createdAt}</TableCell>
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
                              <DropdownMenuItem>Manage Acquirers</DropdownMenuItem>
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
                        No submerchants found
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
