'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { ClientDate } from '@/components/client-date'
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
import { toast } from 'sonner'
import { DisburseAcquirer } from '@/types/disburse-acquirer.type'
import { getDisburseAcquirerById } from '@/app/dashboard/disburse-acquirers/actions'
import DisburseAcquirerForm from './disburse-acquirer-form'

interface DisburseAcquirerTableProps {
  disburseAcquirers: DisburseAcquirer[]
}

export default function DisburseAcquirerTable({ disburseAcquirers }: DisburseAcquirerTableProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [editingAcquirer, setEditingAcquirer] = useState<DisburseAcquirer | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = async (acquirer: DisburseAcquirer) => {
    toast.loading('Fetching details...', { id: 'fetch-disburse-acquirer' })
    const result = await getDisburseAcquirerById(acquirer.id)
    toast.dismiss('fetch-disburse-acquirer')

    if (result.success && result.data) {
      setEditingAcquirer(result.data)
      setIsFormOpen(true)
    } else {
      toast.error(result.message || 'Failed to fetch details')
    }
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
            <TableHead>Type</TableHead>
            <TableHead>Source Account No</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {disburseAcquirers.length > 0 ? (
            disburseAcquirers.map((acquirer) => (
              <TableRow key={acquirer.id}>
                <TableCell className="font-medium">
                  {acquirer.name}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {acquirer.type}
                </TableCell>

                <TableCell className="text-muted-foreground font-mono text-xs">
                  {acquirer.source_account_no}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  <ClientDate date={acquirer.created_at} format="dd MMM yyyy" />
                </TableCell>

                <TableCell className="text-muted-foreground">
                  <ClientDate date={acquirer.updated_at} format="dd MMM yyyy" />
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
                        <DropdownMenuItem onClick={() => handleEdit(acquirer)}>
                          Edit
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
                No disburse acquirers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DisburseAcquirerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        disburseAcquirer={editingAcquirer}
      />
    </div>
  )
}
