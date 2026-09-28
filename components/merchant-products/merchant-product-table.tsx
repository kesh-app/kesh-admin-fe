'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, Plus, Edit, Trash2 } from 'lucide-react'
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
import { MerchantProduct } from '@/types/merchant-product.type'
import { deleteMerchantProduct } from '@/app/dashboard/merchant-products/actions'
import MerchantProductForm from './merchant-product-form'

interface MerchantProductTableProps {
  products: MerchantProduct[]
}

export default function MerchantProductTable({ products }: MerchantProductTableProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MerchantProduct | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<MerchantProduct | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleEdit = (product: MerchantProduct) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingProduct) return
    setIsDeleting(true)
    try {
      const result = await deleteMerchantProduct(deletingProduct.id)
      if (result.success) {
        toast.success('Merchant Product deleted successfully')
        setDeletingProduct(null)
      } else {
        toast.error(result.message || 'Failed to delete Merchant Product')
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred while deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCurrency = (amount: string | number) => {
    const num = Number(amount) || 0
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Merchant Products List</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Merchant Product
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Closed Amount</TableHead>
              <TableHead>Fee Amount</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-semibold text-foreground">
                    {product.product_name}
                  </TableCell>

                  <TableCell>
                    <Badge variant={product.type === 'USER' ? 'secondary' : 'default'}>
                      {product.type || 'VA'}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-mono text-xs">
                    {product.code}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{product.provider}</Badge>
                  </TableCell>

                  <TableCell>
                    {product.is_closed_amount ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    {formatCurrency(product.fee_amount)}
                  </TableCell>

                  <TableCell className="text-muted-foreground text-xs">
                    <ClientDate date={product.created_at} format="dd MMM yyyy HH:mm" />
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
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingProduct(product)}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  No merchant products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MerchantProductForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        merchantProduct={editingProduct}
      />

      <Dialog
        open={!!deletingProduct}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null)
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Merchant Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete product{' '}
              <span className="font-semibold text-foreground">
                {deletingProduct?.product_name} ({deletingProduct?.code})
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingProduct(null)}
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
