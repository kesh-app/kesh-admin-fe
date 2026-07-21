'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { ClientDate } from '@/components/client-date'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
import { VaAcquirer } from '@/types/va-acquirer.type'
import { getVaAcquirerById, updateVaAcquirerStatus } from '@/app/dashboard/va-acquirers/actions'
import VaAcquirerForm from './va-acquirer-form'
import AddVaAcquirerButton from './add-va-acquirer-button'

interface VaAcquirerTableProps {
  vaAcquirers: VaAcquirer[]
}

export default function VaAcquirerTable({ vaAcquirers }: VaAcquirerTableProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [editingAcquirer, setEditingAcquirer] = useState<VaAcquirer | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = async (acquirer: VaAcquirer) => {
    toast.loading('Fetching details...', { id: 'fetch-va-acquirer' })
    const result = await getVaAcquirerById(acquirer.id)
    toast.dismiss('fetch-va-acquirer')

    if (result.success && result.data) {
      setEditingAcquirer(result.data)
      setIsFormOpen(true)
    } else {
      toast.error(result.message || 'Failed to fetch details')
    }
  }

  const handleStatusChange = async (acquirer: VaAcquirer, newStatus: boolean) => {
    toast.loading('Updating status...', { id: `status-${acquirer.id}` })
    const result = await updateVaAcquirerStatus(acquirer.id, newStatus)
    
    if (result.success) {
      toast.success('Status updated successfully', { id: `status-${acquirer.id}` })
    } else {
      toast.error(result.message || 'Failed to update status', { id: `status-${acquirer.id}` })
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="p-4 border-b flex justify-between items-center bg-card">
        <h2 className="text-lg font-semibold">VA Acquirers List</h2>
        <AddVaAcquirerButton />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Bank Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {vaAcquirers.length > 0 ? (
            vaAcquirers.map((acquirer) => (
              <TableRow key={acquirer.id}>
                <TableCell className="font-medium">
                  {acquirer.name}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {acquirer.provider}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {acquirer.service_type}
                </TableCell>
                
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {acquirer.source_bank_code || '-'}
                </TableCell>

                <TableCell>
                  <Switch 
                    checked={acquirer.is_status} 
                    onCheckedChange={(checked) => handleStatusChange(acquirer, checked)}
                    disabled={!isMounted}
                  />
                </TableCell>

                <TableCell className="text-muted-foreground">
                  <ClientDate date={acquirer.created_at} format="dd MMM yyyy" />
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
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No VA acquirers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <VaAcquirerForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingAcquirer(null)
        }}
        vaAcquirer={editingAcquirer}
      />
    </div>
  )
}
