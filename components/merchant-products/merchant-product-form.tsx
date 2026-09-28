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
import {
  MerchantProduct,
  CreateMerchantProductRequest,
  UpdateMerchantProductRequest,
  ProductType,
} from '@/types/merchant-product.type'
import {
  createMerchantProduct,
  updateMerchantProduct,
} from '@/app/dashboard/merchant-products/actions'
import { VA_PRODUCT_CODES } from '@/libs/datas/va_product_code.data'
import { USER_PRODUCT_CODES } from '@/libs/datas/user_product.data'

const formSchema = z.object({
  type: z.enum(['VA', 'USER']),
  provider: z.string().min(1, 'Provider is required'),
  product_name: z.string().min(1, 'Product Name is required'),
  code: z.string().min(1, 'Code is required'),
  is_closed_amount: z.boolean(),
  fee_amount: z.coerce.number().min(0, 'Fee Amount must be at least 0'),
})

type MerchantProductFormValues = z.infer<typeof formSchema>

interface MerchantProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  merchantProduct?: MerchantProduct | null
}

export default function MerchantProductForm({
  open,
  onOpenChange,
  merchantProduct,
}: MerchantProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!merchantProduct

  const form = useForm<MerchantProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'VA',
      provider: '',
      product_name: '',
      code: '',
      is_closed_amount: false,
      fee_amount: 0,
    },
  })

  const selectedType = form.watch('type')
  const selectedProvider = form.watch('provider')

  // Provider options based on selected type
  const providerOptions = useMemo(() => {
    if (selectedType === 'USER') {
      return USER_PRODUCT_CODES.map((item) => item.gateway_code)
    }
    return VA_PRODUCT_CODES.map((item) => item.gateway_code)
  }, [selectedType])

  // Product name options based on selected provider if type is VA
  const productNameOptions = useMemo(() => {
    if (selectedType !== 'VA' || !selectedProvider) return []
    const gateway = VA_PRODUCT_CODES.find(
      (item) => item.gateway_code.toUpperCase() === selectedProvider.toUpperCase()
    )
    if (!gateway || !gateway.data_products) return []
    return gateway.data_products.map((dp) => dp.product_name)
  }, [selectedType, selectedProvider])

  useEffect(() => {
    if (open) {
      if (merchantProduct) {
        form.reset({
          type: (merchantProduct.type as ProductType) || 'VA',
          provider: merchantProduct.provider || '',
          product_name: merchantProduct.product_name || '',
          code: merchantProduct.code || '',
          is_closed_amount: merchantProduct.is_closed_amount ?? false,
          fee_amount: Number(merchantProduct.fee_amount) || 0,
        })
      } else {
        const defaultType: ProductType = 'VA'
        const defaultProvider = VA_PRODUCT_CODES[0]?.gateway_code || ''
        const defaultProduct = VA_PRODUCT_CODES[0]?.data_products?.[0]?.product_name || ''
        form.reset({
          type: defaultType,
          provider: defaultProvider,
          product_name: defaultProduct,
          code: '',
          is_closed_amount: false,
          fee_amount: 0,
        })
      }
    }
  }, [open, merchantProduct, form])

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ProductType
    form.setValue('type', newType, { shouldValidate: true })

    if (newType === 'USER') {
      const firstProvider = USER_PRODUCT_CODES[0]?.gateway_code || ''
      form.setValue('provider', firstProvider, { shouldValidate: true })
      form.setValue('product_name', '', { shouldValidate: true })
    } else {
      const firstGateway = VA_PRODUCT_CODES[0]
      const firstProvider = firstGateway?.gateway_code || ''
      const firstProduct = firstGateway?.data_products?.[0]?.product_name || ''
      form.setValue('provider', firstProvider, { shouldValidate: true })
      form.setValue('product_name', firstProduct, { shouldValidate: true })
    }
  }

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value
    form.setValue('provider', newProvider, { shouldValidate: true })

    if (form.getValues('type') === 'VA') {
      const gateway = VA_PRODUCT_CODES.find(
        (item) => item.gateway_code.toUpperCase() === newProvider.toUpperCase()
      )
      const firstProduct = gateway?.data_products?.[0]?.product_name || ''
      form.setValue('product_name', firstProduct, { shouldValidate: true })
    }
  }

  const onSubmit = async (values: MerchantProductFormValues) => {
    setIsLoading(true)
    try {
      let result
      if (isEdit && merchantProduct) {
        result = await updateMerchantProduct(merchantProduct.id, values as UpdateMerchantProductRequest)
      } else {
        result = await createMerchantProduct(values as CreateMerchantProductRequest)
      }

      if (result.success) {
        toast.success(
          isEdit ? 'Merchant Product updated successfully' : 'Merchant Product created successfully'
        )
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.message || 'Failed to save Merchant Product')
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
          <DialogTitle>{isEdit ? 'Edit Merchant Product' : 'Add New Merchant Product'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this Merchant Product configuration.'
              : 'Enter the details to create a new Merchant Product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
              <p className="text-xs text-destructive">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

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
              {providerOptions.map((gatewayCode) => (
                <option key={gatewayCode} value={gatewayCode}>
                  {gatewayCode}
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
            {selectedType === 'VA' && productNameOptions.length > 0 ? (
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
            ) : (
              <Input
                {...form.register('product_name')}
                placeholder="e.g. USER_BALANCE / DANA / GOPAY"
                className={form.formState.errors.product_name ? 'border-destructive' : ''}
              />
            )}
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
              {isLoading ? 'Saving...' : isEdit ? 'Update Merchant Product' : 'Create Merchant Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
