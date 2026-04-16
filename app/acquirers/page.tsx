'use client'

import { useState } from 'react'
import { Search, MoreHorizontal, Plus } from 'lucide-react'
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
import { acquirers, submerchants } from '@/libs/mock-data'

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
    const matchesSearch =
      acquirer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acquirer.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || acquirer.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statuses = Array.from(new Set(acquirers.map((a) => a.status)))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Acquirers</h1>
          <p className="mt-1 text-muted-foreground">
            Manage payment acquirer integrations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Acquirer
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-foreground">Search</label>
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

            <div className="w-full md:w-48">
              <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
              <select
                value={filterStatus || ''}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Bank Acquirers</CardTitle>
          <CardDescription>
            Showing {filteredAcquirers.length} of {acquirers.length} acquirers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border bg-background">
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
                  filteredAcquirers.map((acquirer) => {
                    const assignedCount = submerchants.filter(
                      (submerchant) => submerchant.acquirerCode === acquirer.code
                    ).length

                    return (
                      <TableRow key={acquirer.id}>
                        <TableCell className="font-medium">{acquirer.name}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {acquirer.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(acquirer.status)}>
                            {acquirer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignedCount}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {acquirer.createdAt}
                        </TableCell>
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Disable
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
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
  )
}