'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
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
import { VaProduct, CreateVaProductRequest, UpdateVaProductRequest } from '@/types/va-product.type'
import { createVaProduct, updateVaProduct } from '@/app/dashboard/va-products/actions'
import { VA_PRODUCT_CODES } from '@/libs/datas/va_product_code.data'

const formSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  product_name: z.string().min(1, 'Product Name is required'),
  code: z.string().min(1, 'Code is required'),
  is_closed_amount: z.boolean(),
  fee_amount: z.coerce.number().min(0, 'Fee Amount must be at least 0'),
})

type VaProductFormValues = z.infer<typeof formSchema>

interface VaProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaProduct?: VaProduct | null
}

export default function VaProductForm({ open, onOpenChange, vaProduct }: VaProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!vaProduct

  const form = useForm<VaProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: '',
      product_name: '',
      code: '',
      is_closed_amount: false,
      fee_amount: 0,
    },
  })

  const selectedProvider = form.watch('provider')

  // Product name options based on selected provider from VA_PRODUCT_CODES
  const productNameOptions = useMemo(() => {
    if (!selectedProvider) return []
    const gateway = VA_PRODUCT_CODES.find(
      (item) => item.gateway_code.toUpperCase() === selectedProvider.toUpperCase()
    )
    if (!gateway) return []
    return gateway.data_products.map((dp) => dp.product_name)
  }, [selectedProvider])

  useEffect(() => {
    if (open) {
      if (vaProduct) {
        form.reset({
          provider: vaProduct.provider || '',
          product_name: vaProduct.product_name || '',
          code: vaProduct.code || '',
          is_closed_amount: vaProduct.is_closed_amount ?? false,
          fee_amount: Number(vaProduct.fee_amount) || 0,
        })
      } else {
        form.reset({
          provider: VA_PRODUCT_CODES[0]?.gateway_code || '',
          product_name: VA_PRODUCT_CODES[0]?.data_products[0]?.product_name || '',
          code: '',
          is_closed_amount: false,
          fee_amount: 0,
        })
      }
    }
  }, [open, vaProduct, form])

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value
    form.setValue('provider', newProvider, { shouldValidate: true })

    const gateway = VA_PRODUCT_CODES.find(
      (item) => item.gateway_code.toUpperCase() === newProvider.toUpperCase()
    )
    const firstProduct = gateway?.data_products[0]?.product_name || ''
    form.setValue('product_name', firstProduct, { shouldValidate: true })
  }

  const onSubmit = async (values: VaProductFormValues) => {
    setIsLoading(true)
    try {
      let result
      if (isEdit && vaProduct) {
        result = await updateVaProduct(vaProduct.id, values as UpdateVaProductRequest)
      } else {
        result = await createVaProduct(values as CreateVaProductRequest)
      }

      if (result.success) {
        toast.success(
          isEdit ? 'VA Product updated successfully' : 'VA Product created successfully'
        )
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.message || 'Failed to save VA Product')
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit VA Product' : 'Add New VA Product'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this VA Product configuration.'
              : 'Enter the details to create a new VA Product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <select
              value={form.watch('provider')}
              onChange={handleProviderChange}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground ${
                form.formState.errors.provider ? 'border-destructive' : ''
              }`}
            >
              <option value="" disabled>
                Select Provider
              </option>
              {VA_PRODUCT_CODES.map((g) => (
                <option key={g.gateway_code} value={g.gateway_code}>
                  {g.gateway_code}
                </option>
              ))}
            </select>
            {form.formState.errors.provider && (
              <p className="text-xs text-destructive">
                {form.formState.errors.provider.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name</label>
            <select
              {...form.register('product_name')}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground ${
                form.formState.errors.product_name ? 'border-destructive' : ''
              }`}
            >
              <option value="" disabled>
                Select Product Name
              </option>
              {productNameOptions.map((pn) => (
                <option key={pn} value={pn}>
                  {pn}
                </option>
              ))}
            </select>
            {form.formState.errors.product_name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.product_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Product Code</label>
            <Input
              {...form.register('code')}
              placeholder="e.g. DANA_TOPUP / 00OVOTOPUP"
              className={form.formState.errors.code ? 'border-destructive' : ''}
            />
            {form.formState.errors.code && (
              <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fee Amount</label>
            <Input
              type="number"
              min="0"
              step="any"
              {...form.register('fee_amount')}
              placeholder="1000"
              className={form.formState.errors.fee_amount ? 'border-destructive' : ''}
            />
            {form.formState.errors.fee_amount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.fee_amount.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is_closed_amount"
              checked={form.watch('is_closed_amount')}
              onCheckedChange={(checked) =>
                form.setValue('is_closed_amount', checked, { shouldValidate: true })
              }
            />
            <label htmlFor="is_closed_amount" className="text-sm font-medium cursor-pointer">
              Closed Amount (Fix Nominal)
            </label>
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
              {isLoading ? 'Saving...' : isEdit ? 'Update VA Product' : 'Create VA Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
