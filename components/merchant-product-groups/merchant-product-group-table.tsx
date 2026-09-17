'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'
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
import { deleteMerchantProductGroup } from '@/app/dashboard/merchant-products/actions'
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

  const [deletingGroup, setDeletingGroup] = useState<MerchantProductGroup | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!deletingGroup) return
    setIsDeleting(true)
    try {
      const result = await deleteMerchantProductGroup(deletingGroup.id)
      if (result.success) {
        toast.success('Product Group deleted successfully')
        setDeletingGroup(null)
      } else {
        toast.error(result.message || 'Failed to delete Product Group')
      }
    } catch {
      toast.error('An unexpected error occurred while deleting')
    } finally {
      setIsDeleting(false)
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
                            <DropdownMenuItem
                              onClick={() => setDeletingGroup(group)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
        open={!!deletingGroup}
        onOpenChange={(open) => {
          if (!open) setDeletingGroup(null)
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete group{' '}
              <span className="font-semibold text-foreground">
                {deletingGroup?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingGroup(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
