'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteVaProduct, updateVaProduct } from '@/app/dashboard/va-products/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { validateVaProductRouting } from '@/libs/va-product-routing'
import { VaProduct } from '@/types/va-product.type'

import VaProductForm from './va-product-form'

interface VaProductTableProps {
  products: VaProduct[]
}

interface ActivationChange {
  product: VaProduct
  nextActive: boolean
}

function amountOrNull(value: string | number | null): number | null {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatCurrency(amount: string | number | null) {
  if (amount == null || amount === '') return '—'
  const parsed = Number(amount)
  if (!Number.isFinite(parsed)) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parsed)
}

export default function VaProductTable({ products }: VaProductTableProps) {
  const router = useRouter()
  const [editingProduct, setEditingProduct] = useState<VaProduct | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<VaProduct | null>(null)
  const [activationChange, setActivationChange] = useState<ActivationChange | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingActivation, setIsUpdatingActivation] = useState(false)

  const activationErrors = activationChange
    ? validateVaProductRouting({
        provider: activationChange.product.provider,
        general_code: activationChange.product.general_code,
        routing_priority: activationChange.product.routing_priority,
        is_routing_active: activationChange.nextActive,
        denomination_amount: amountOrNull(activationChange.product.denomination_amount),
        min_amount: amountOrNull(activationChange.product.min_amount),
        max_amount: amountOrNull(activationChange.product.max_amount),
        is_closed_amount: activationChange.product.is_closed_amount,
      })
    : []

  const handleDelete = async () => {
    if (!deletingProduct) return
    setIsDeleting(true)
    try {
      const result = await deleteVaProduct(deletingProduct.id)
      if (!result.success) {
        toast.error(result.message || 'Failed to delete VA Product')
        return
      }
      toast.success('VA Product deleted successfully')
      setDeletingProduct(null)
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred while deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleActivationChange = async () => {
    if (!activationChange || activationErrors.length > 0) return
    setIsUpdatingActivation(true)
    try {
      const result = await updateVaProduct(activationChange.product.id, {
        is_routing_active: activationChange.nextActive,
      })
      if (!result.success) {
        toast.error(result.message || 'Failed to update routing activation')
        return
      }
      toast.success(
        `Route ${activationChange.nextActive ? 'activated' : 'deactivated'} successfully`,
      )
      setActivationChange(null)
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred while updating the route')
    } finally {
      setIsUpdatingActivation(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">VA Products List</h2>
          <p className="text-xs text-muted-foreground">
            Toggle changes require confirmation and refresh routing data automatically.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null)
            setIsFormOpen(true)
          }}
          size="sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add VA Product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>General Code</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Provider Code</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Routing Active</TableHead>
              <TableHead>Denomination</TableHead>
              <TableHead>Min / Max</TableHead>
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
                    {product.general_code ? (
                      <Badge variant="secondary">{product.general_code}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not routed</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.provider}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{product.code}</TableCell>
                  <TableCell className="font-medium">{product.routing_priority}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        aria-label={`${product.is_routing_active ? 'Deactivate' : 'Activate'} ${product.code}`}
                        checked={product.is_routing_active}
                        disabled={isUpdatingActivation}
                        onCheckedChange={(nextActive) =>
                          setActivationChange({ product, nextActive })
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {product.is_routing_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatCurrency(product.denomination_amount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatCurrency(product.min_amount)} / {formatCurrency(product.max_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingProduct(product)
                            setIsFormOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingProduct(product)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  No VA products match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <VaProductForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        vaProduct={editingProduct}
      />

      <Dialog open={Boolean(activationChange)} onOpenChange={(open) => !open && setActivationChange(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              {activationChange?.nextActive ? 'Activate routing?' : 'Deactivate routing?'}
            </DialogTitle>
            <DialogDescription>
              Confirm the routing status change for{' '}
              <span className="font-semibold text-foreground">
                {activationChange?.product.general_code || activationChange?.product.product_name} /{' '}
                {activationChange?.product.provider} ({activationChange?.product.code})
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          {activationErrors.length > 0 && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {activationErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivationChange(null)} disabled={isUpdatingActivation}>
              Cancel
            </Button>
            <Button
              onClick={handleActivationChange}
              disabled={isUpdatingActivation || activationErrors.length > 0}
            >
              {isUpdatingActivation ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingProduct)} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete VA Product</DialogTitle>
            <DialogDescription>
              Delete{' '}
              <span className="font-semibold text-foreground">
                {deletingProduct?.product_name} ({deletingProduct?.code})
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProduct(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
