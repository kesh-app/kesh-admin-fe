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

export default function SubmerchantPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const filteredSubmerchants = submerchants.filter((submerchant) => {
    const matchesSearch =
      submerchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submerchant.merchantId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || submerchant.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statuses = Array.from(new Set(submerchants.map((s) => s.status)))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Submerchants</h1>
          <p className="mt-1 text-muted-foreground">
            Manage merchant accounts and their acquirer relationship
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Submerchant
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
                  placeholder="Search by name or merchant ID..."
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
          <CardTitle>Submerchants</CardTitle>
          <CardDescription>
            Showing {filteredSubmerchants.length} of {submerchants.length} submerchants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Merchant ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acquirer</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmerchants.length > 0 ? (
                  filteredSubmerchants.map((submerchant) => {
                    const acquirer = acquirers.find(
                      (item) => item.code === submerchant.acquirerCode
                    )

                    return (
                      <TableRow key={submerchant.id}>
                        <TableCell className="font-medium">{submerchant.name}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {submerchant.merchantId}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(submerchant.status)}>
                            {submerchant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {acquirer ? (
                            <Badge variant="secondary">{acquirer.code}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submerchant.createdAt}
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
  )
}