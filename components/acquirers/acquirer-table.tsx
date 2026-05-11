'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Acquirer } from '@/types/acquirer.type'
import AcquirerForm from './acquirer-form'

interface AcquirerTableProps {
  acquirers: Acquirer[]
}

export default function AcquirerTable({ acquirers }: AcquirerTableProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [editingAcquirer, setEditingAcquirer] = useState<Acquirer | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = (acquirer: Acquirer) => {
    setEditingAcquirer(acquirer)
    setIsFormOpen(true)
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sub-merchants</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {acquirers.length > 0 ? (
            acquirers.map((acquirer) => (
              <TableRow key={acquirer.id}>
                <TableCell className="font-medium">
                  {acquirer.name}
                </TableCell>

                <TableCell>
                  <Badge variant={acquirer.is_status ? 'success' : 'secondary'}>
                    {acquirer.is_status ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                <TableCell>
                  {acquirer.total_sub_merchants}
                </TableCell>

                <TableCell className="text-muted-foreground" suppressHydrationWarning>
                  {acquirer.created_at ? format(new Date(acquirer.created_at), 'dd MMM yyyy') : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground" suppressHydrationWarning>
                  {acquirer.updated_at ? format(new Date(acquirer.updated_at), 'dd MMM yyyy') : '-'}
                </TableCell>

                <TableCell className="text-right">
                  {isMounted ? (
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
                        <DropdownMenuItem onClick={() => handleEdit(acquirer)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Disable
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button variant="ghost" size="icon" disabled>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                No acquirers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AcquirerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        acquirer={editingAcquirer}
      />
    </div>
  )
}
