'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, Plus, Edit, PowerOff, Power, CheckCircle2, XCircle } from 'lucide-react'
import { ClientDate } from '@/components/client-date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { MerchantProduct, MerchantProductGroup } from '@/types/merchant-product.type'
import { updateMerchantProductGroup } from '@/app/dashboard/merchant-products/actions'
import MerchantProductGroupForm from './merchant-product-group-form'

interface MerchantProductGroupTableProps {
  groups: MerchantProductGroup[]
  allProducts: MerchantProduct[]
}

export default function MerchantProductGroupTable({
  groups,
  allProducts,
}: MerchantProductGroupTableProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [editingGroup, setEditingGroup] = useState<MerchantProductGroup | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [statusChangingGroup, setStatusChangingGroup] = useState<MerchantProductGroup | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleEdit = (group: MerchantProductGroup) => {
    setEditingGroup(group)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingGroup(null)
    setIsFormOpen(true)
  }

  const handleToggleStatus = async () => {
    if (!statusChangingGroup) return
    setIsUpdatingStatus(true)
    const newStatus = !statusChangingGroup.is_active
    try {
      const result = await updateMerchantProductGroup(statusChangingGroup.id, {
        is_active: newStatus,
      })
      if (result.success) {
        toast.success(
          `Product Group ${newStatus ? 'activated' : 'deactivated'} successfully`
        )
        setStatusChangingGroup(null)
      } else {
        toast.error(result.message || 'Failed to update Product Group status')
      }
    } catch {
      toast.error('An unexpected error occurred while updating status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Product Groups List</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Product Group
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {groups.length > 0 ? (
              groups.map((group) => {
                const count =
                  group.products_count ??
                  (group.products?.length || group.product_ids?.length || 0)

                return (
                  <TableRow key={group.id}>
                    <TableCell className="font-semibold text-foreground">
                      {group.name}
                    </TableCell>

                    <TableCell>
                      <Badge variant={group.type === 'USER' ? 'secondary' : 'default'}>
                        {group.type || 'VA'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {group.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" />
                          Inactive
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline">
                          {count} {count === 1 ? 'product' : 'products'}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-xs">
                      <ClientDate date={group.created_at} format="dd MMM yyyy HH:mm" />
                    </TableCell>

                    <TableCell className="text-right">
                      {isMounted ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(group)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {group.is_active ? (
                              <DropdownMenuItem
                                onClick={() => setStatusChangingGroup(group)}
                                className="text-destructive focus:text-destructive"
                              >
                                <PowerOff className="h-4 w-4 mr-2" />
                                Set Inactive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setStatusChangingGroup(group)}
                                className="text-green-600 focus:text-green-600"
                              >
                                <Power className="h-4 w-4 mr-2" />
                                Set Active
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button variant="ghost" size="icon" disabled className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No product groups found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MerchantProductGroupForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingGroup(null)
        }}
        merchantProductGroup={editingGroup}
        allProducts={allProducts}
      />

      <Dialog
        open={!!statusChangingGroup}
        onOpenChange={(open) => {
          if (!open) setStatusChangingGroup(null)
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {statusChangingGroup?.is_active
                ? 'Deactivate Product Group'
                : 'Activate Product Group'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to set group{' '}
              <span className="font-semibold text-foreground">
                {statusChangingGroup?.name}
              </span>{' '}
              to {statusChangingGroup?.is_active ? 'inactive' : 'active'}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusChangingGroup(null)}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={statusChangingGroup?.is_active ? 'destructive' : 'default'}
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus
                ? 'Updating...'
                : statusChangingGroup?.is_active
                ? 'Set Inactive'
                : 'Set Active'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

