'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  Search,
  X,
  GripVertical,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  MerchantProduct,
  MerchantProductGroup,
  CreateMerchantProductGroupRequest,
  UpdateMerchantProductGroupRequest,
  MerchantProductGroupProduct,
  MerchantProductGroupProductItem,
} from '@/types/merchant-product.type'
import {
  createMerchantProductGroup,
  updateMerchantProductGroup,
} from '@/app/dashboard/merchant-products/actions'
import { VA_PRODUCT_CODES } from '@/libs/datas/va_product_code.data'
import { USER_PRODUCT_CODES } from '@/libs/datas/user_product.data'

const formSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  type: z.enum(['VA', 'USER']),
  is_active: z.boolean(),
})


type GroupFormValues = z.infer<typeof formSchema>

interface MerchantProductGroupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  merchantProductGroup?: MerchantProductGroup | null
  allProducts: MerchantProduct[]
}

export default function MerchantProductGroupForm({
  open,
  onOpenChange,
  merchantProductGroup,
  allProducts,
}: MerchantProductGroupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!merchantProductGroup

  // Selected products with priority
  const [selectedProducts, setSelectedProducts] = useState<MerchantProductGroupProduct[]>([])

  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  // Product search/picker state
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'VA',
      is_active: true,
    },
  })

  const selectedType = form.watch('type')

  // Group name options based on selected type
  const groupNameOptions = useMemo(() => {
    if (selectedType === 'USER') {
      return Array.from(new Set(USER_PRODUCT_CODES.map((item) => item.gateway_code)))
    }
    return Array.from(
      new Set(
        VA_PRODUCT_CODES.flatMap((gw) =>
          gw.data_products ? gw.data_products.map((dp) => dp.product_name) : []
        )
      )
    )
  }, [selectedType])

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'VA' | 'USER'
    form.setValue('type', newType, { shouldValidate: true })
    setSelectedProducts([])
    const options =
      newType === 'USER'
        ? Array.from(new Set(USER_PRODUCT_CODES.map((item) => item.gateway_code)))
        : Array.from(
            new Set(
              VA_PRODUCT_CODES.flatMap((gw) =>
                gw.data_products ? gw.data_products.map((dp) => dp.product_name) : []
              )
            )
          )
    form.setValue('name', options[0] || '', { shouldValidate: true })
  }

  // Filter allProducts by selected type and search
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => !selectedType || p.type === selectedType || !p.type)
      .filter((p) => {
        if (!pickerSearch.trim()) return true
        const s = pickerSearch.toLowerCase()
        return (
          p.product_name.toLowerCase().includes(s) ||
          p.code.toLowerCase().includes(s) ||
          p.provider.toLowerCase().includes(s)
        )
      })
  }, [allProducts, selectedType, pickerSearch])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (merchantProductGroup) {
        form.reset({
          name: merchantProductGroup.name || '',
          type: merchantProductGroup.type || 'VA',
          is_active: merchantProductGroup.is_active ?? true,
        })

        // Restore selected products from group
        // Products in response can be either MerchantProductGroupProductItem (with .id) or MerchantProductGroupProduct (with .product_id)
        let initialProducts: MerchantProductGroupProduct[] = []

        if (merchantProductGroup.products && merchantProductGroup.products.length > 0) {
          initialProducts = merchantProductGroup.products.map((item, idx) => {
            const prodItem = item as MerchantProductGroupProductItem
            const prodRef = item as MerchantProductGroupProduct
            return {
              product_id: prodItem.id || prodRef.product_id,
              priority: item.priority ?? idx + 1,
            }
          })
          // Sort by priority ascending
          initialProducts.sort((a, b) => a.priority - b.priority)
        } else if (merchantProductGroup.product_ids && merchantProductGroup.product_ids.length > 0) {
          initialProducts = merchantProductGroup.product_ids.map((id, idx) => ({
            product_id: id,
            priority: idx + 1,
          }))
        }

        setSelectedProducts(initialProducts)
      } else {
        const defaultType: 'VA' | 'USER' = 'VA'
        const defaultOptions = Array.from(
          new Set(
            VA_PRODUCT_CODES.flatMap((gw) =>
              gw.data_products ? gw.data_products.map((dp) => dp.product_name) : []
            )
          )
        )
        form.reset({
          name: defaultOptions[0] || '',
          type: defaultType,
          is_active: true,
        })
        setSelectedProducts([])
      }
      setPickerSearch('')
      setPickerOpen(false)
      setDraggedIdx(null)
      setDragOverIdx(null)
    }
  }, [open, merchantProductGroup, form])


  const isProductSelected = (productId: string) =>
    selectedProducts.some((sp) => sp.product_id === productId)

  const toggleProduct = (product: MerchantProduct) => {
    if (isProductSelected(product.id)) {
      setSelectedProducts((prev) => {
        const next = prev.filter((sp) => sp.product_id !== product.id)
        return next.map((sp, idx) => ({ ...sp, priority: idx + 1 }))
      })
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        { product_id: product.id, priority: prev.length + 1 },
      ])
    }
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = prev.filter((sp) => sp.product_id !== productId)
      return next.map((sp, idx) => ({ ...sp, priority: idx + 1 }))
    })
  }

  // Move item up / down in list
  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= selectedProducts.length) return
    setSelectedProducts((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIdx, 1)
      updated.splice(toIdx, 0, moved)
      // Re-assign priorities sequentially based on new order
      return updated.map((sp, idx) => ({ ...sp, priority: idx + 1 }))
    })
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIdx !== idx) {
      setDragOverIdx(idx)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === dropIdx) {
      setDraggedIdx(null)
      setDragOverIdx(null)
      return
    }

    moveItem(draggedIdx, dropIdx)
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const getProductById = (id: string): MerchantProduct | MerchantProductGroupProductItem | undefined => {
    // Check in allProducts first
    const fromAll = allProducts.find((p) => p.id === id)
    if (fromAll) return fromAll

    // If editing, check within group products detail
    if (merchantProductGroup?.products) {
      const match = merchantProductGroup.products.find((p) => {
        const item = p as MerchantProductGroupProductItem
        return item.id === id || (p as MerchantProductGroupProduct).product_id === id
      })
      if (match && 'product_name' in match) {
        return match as MerchantProductGroupProductItem
      }
    }
    return undefined
  }

  const onSubmit = async (values: GroupFormValues) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product')
      return
    }

    setIsLoading(true)
    try {
      const payload: CreateMerchantProductGroupRequest = {
        name: values.name,
        type: values.type,
        is_active: values.is_active,
        product_ids: selectedProducts.map((sp) => sp.product_id),
        products: selectedProducts.map((sp) => ({
          product_id: sp.product_id,
          priority: sp.priority,
        })),
      }

      let result
      if (isEdit && merchantProductGroup) {
        result = await updateMerchantProductGroup(
          merchantProductGroup.id,
          payload as UpdateMerchantProductGroupRequest
        )
      } else {
        result = await createMerchantProductGroup(payload)
      }

      if (result.success) {
        toast.success(
          isEdit ? 'Product Group updated successfully' : 'Product Group created successfully'
        )
        onOpenChange(false)
        form.reset()
        setSelectedProducts([])
      } else {
        toast.error(result.message || 'Failed to save Product Group')
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Product Group' : 'Add New Product Group'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this Product Group and rearrange product priority.'
              : 'Enter details and pick products. Drag and drop or use arrows to rearrange priority.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select
              value={form.watch('type')}
              onChange={handleTypeChange}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground ${
                form.formState.errors.type ? 'border-destructive' : ''
              }`}
            >
              <option value="VA">VA</option>
              <option value="USER">USER</option>
            </select>
            {form.formState.errors.type && (
              <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Group Name</label>
            <select
              value={form.watch('name')}
              onChange={(e) => form.setValue('name', e.target.value, { shouldValidate: true })}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground ${
                form.formState.errors.name ? 'border-destructive' : ''
              }`}
            >
              <option value="" disabled>
                Select Group Name
              </option>
              {groupNameOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              {form.watch('name') && !groupNameOptions.includes(form.watch('name')) && (
                <option value={form.watch('name')}>{form.watch('name')}</option>
              )}
            </select>
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>


          {/* Is Active */}
          <div className="flex items-center space-x-2 pt-1">
            <Switch
              id="is_active"
              checked={form.watch('is_active')}
              onCheckedChange={(checked) =>
                form.setValue('is_active', checked, { shouldValidate: true })
              }
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              Active
            </label>
          </div>

          {/* Products picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Products{' '}
                <span className="text-muted-foreground font-normal">
                  ({selectedProducts.length} selected)
                </span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setPickerOpen((v) => !v)}
              >
                <ChevronsUpDown className="h-3.5 w-3.5" />
                {pickerOpen ? 'Close Picker' : 'Select Products'}
              </Button>
            </div>

            {/* Picker dropdown */}
            {pickerOpen && (
              <div className="border rounded-lg bg-background shadow-sm">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search by name, code, or provider..."
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-4">
                      No products found
                    </p>
                  ) : (
                    filteredProducts.map((product) => {
                      const selected = isProductSelected(product.id)
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => toggleProduct(product)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                            selected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                              selected
                                ? 'bg-primary border-primary'
                                : 'border-input'
                            }`}
                          >
                            {selected && (
                              <svg
                                className="h-2.5 w-2.5 text-primary-foreground"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.product_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {product.code} • {product.provider}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">
                            {product.type || 'VA'}
                          </Badge>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Selected products list with Rearrange / Drag & Drop */}
            {selectedProducts.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Rearrange priority (drag & drop handle or use arrows):
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    Top = highest priority (1)
                  </span>
                </div>
                <div className="border rounded-lg divide-y bg-background overflow-hidden">
                  {selectedProducts.map((sp, idx) => {
                    const product = getProductById(sp.product_id)
                    const isDragging = draggedIdx === idx
                    const isOver = dragOverIdx === idx

                    return (
                      <div
                        key={sp.product_id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 px-3 py-2 transition-colors cursor-move select-none ${
                          isDragging ? 'opacity-40 bg-muted/60' : ''
                        } ${isOver && !isDragging ? 'border-t-2 border-primary bg-primary/5' : ''} hover:bg-muted/40`}
                      >
                        {/* Drag handle icon */}
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex-shrink-0"
                          title="Drag to rearrange"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Priority Badge */}
                        <Badge
                          variant="secondary"
                          className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold flex-shrink-0"
                        >
                          {sp.priority}
                        </Badge>

                        {/* Product details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {product?.product_name ?? sp.product_id}
                          </p>
                          {product && (
                            <p className="text-xs text-muted-foreground truncate">
                              {product.code} • {product.provider}
                            </p>
                          )}
                        </div>

                        {/* Up / Down arrows for keyboard/click accessibility */}
                        <div className="flex flex-col gap-0.5 flex-shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveItem(idx, idx - 1)}
                            className="h-4 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === selectedProducts.length - 1}
                            onClick={() => moveItem(idx, idx + 1)}
                            className="h-4 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeProduct(sp.product_id)}
                          className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                          title="Remove product"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedProducts.length === 0 && !pickerOpen && (
              <p className="text-xs text-muted-foreground border border-dashed rounded-lg p-3 text-center">
                No products selected. Click &quot;Select Products&quot; to add.
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : isEdit
                ? 'Update Product Group'
                : 'Create Product Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
