'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { createVaProduct, updateVaProduct } from '@/app/dashboard/va-products/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { VA_PRODUCT_CODES } from '@/libs/datas/va_product_code.data'
import { validateVaProductRouting } from '@/libs/va-product-routing'
import {
  CreateVaProductRequest,
  SMART_VA_GENERAL_CODES,
  SMART_VA_PROVIDERS,
  SmartVaGeneralCode,
  SmartVaProvider,
  UpdateVaProductRequest,
  VaProduct,
} from '@/types/va-product.type'

const optionalAmount = z.number().min(0, 'Amount must be at least 0').optional()

const formSchema = z
  .object({
    provider: z.enum(SMART_VA_PROVIDERS),
    product_name: z.string().trim().min(1, 'Product name is required'),
    code: z.string().trim().min(1, 'Provider code is required'),
    general_code: z.union([z.enum(SMART_VA_GENERAL_CODES), z.literal('')]),
    routing_priority: z
      .number()
      .int('Routing priority must be an integer')
      .min(1, 'Routing priority must be at least 1'),
    is_routing_active: z.boolean(),
    denomination_amount: optionalAmount,
    min_amount: optionalAmount,
    max_amount: optionalAmount,
    is_closed_amount: z.boolean(),
    fee_amount: z.number().min(0, 'Fee amount must be at least 0'),
  })
  .superRefine((values, context) => {
    const errors = validateVaProductRouting({
      ...values,
      general_code: values.general_code || null,
    })

    errors.forEach((message) => {
      const path = message.startsWith('Routing priority')
        ? ['routing_priority']
        : message.startsWith('Minimum')
          ? ['max_amount']
          : ['denomination_amount']
      context.addIssue({ code: z.ZodIssueCode.custom, message, path })
    })
  })

type VaProductFormValues = z.infer<typeof formSchema>

interface VaProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaProduct?: VaProduct | null
}

function numberOrUndefined(value: string | number | null | undefined): number | undefined {
  if (value == null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function optionalNumberInput(value: unknown): number | undefined {
  if (value === '' || value == null) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export default function VaProductForm({ open, onOpenChange, vaProduct }: VaProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = Boolean(vaProduct)

  const form = useForm<VaProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: 'ICARE',
      product_name: 'GOPAY',
      code: '',
      general_code: 'GOPAY',
      routing_priority: 100,
      is_routing_active: false,
      denomination_amount: undefined,
      min_amount: undefined,
      max_amount: undefined,
      is_closed_amount: false,
      fee_amount: 1000,
    },
  })

  const selectedProvider = useWatch({ control: form.control, name: 'provider' })
  const selectedProductName = useWatch({ control: form.control, name: 'product_name' })
  const isRoutingActive = useWatch({ control: form.control, name: 'is_routing_active' })
  const isClosedAmount = useWatch({ control: form.control, name: 'is_closed_amount' })

  const selectedGateway = useMemo(
    () =>
      VA_PRODUCT_CODES.find(
        (item) => item.gateway_code.toUpperCase() === selectedProvider.toUpperCase(),
      ),
    [selectedProvider],
  )
  const productNameOptions = selectedGateway?.data_products.map((product) => product.product_name) ?? []

  useEffect(() => {
    if (!open) return

    if (vaProduct) {
      form.reset({
        provider: vaProduct.provider,
        product_name: vaProduct.product_name,
        code: vaProduct.code,
        general_code: vaProduct.general_code ?? '',
        routing_priority: vaProduct.routing_priority ?? 100,
        is_routing_active: vaProduct.is_routing_active ?? false,
        denomination_amount: numberOrUndefined(vaProduct.denomination_amount),
        min_amount: numberOrUndefined(vaProduct.min_amount),
        max_amount: numberOrUndefined(vaProduct.max_amount),
        is_closed_amount: vaProduct.is_closed_amount ?? false,
        fee_amount: numberOrUndefined(vaProduct.fee_amount) ?? 0,
      })
      return
    }

    const defaultGateway = VA_PRODUCT_CODES.find((item) => item.gateway_code === 'ICARE')
    const defaultProduct = defaultGateway?.data_products[0]
    form.reset({
      provider: 'ICARE',
      product_name: defaultProduct?.product_name ?? 'GOPAY',
      code: defaultProduct?.products[0]?.product_code ?? '',
      general_code: (defaultProduct?.product_name as SmartVaGeneralCode) ?? 'GOPAY',
      routing_priority: 100,
      is_routing_active: false,
      denomination_amount:
        defaultProduct?.products[0] && 'close_amount' in defaultProduct.products[0]
          ? defaultProduct.products[0].close_amount
          : undefined,
      min_amount: undefined,
      max_amount: undefined,
      is_closed_amount: defaultProduct?.products[0]?.is_closed_amount ?? false,
      fee_amount: 1000,
    })
  }, [form, open, vaProduct])

  const applyCatalogProduct = (provider: SmartVaProvider, productName: string) => {
    const gateway = VA_PRODUCT_CODES.find((item) => item.gateway_code === provider)
    const catalogProduct = gateway?.data_products.find((product) => product.product_name === productName)
    const providerProduct = catalogProduct?.products[0]

    form.setValue('product_name', productName, { shouldValidate: true })
    if (SMART_VA_GENERAL_CODES.includes(productName as SmartVaGeneralCode)) {
      form.setValue('general_code', productName as SmartVaGeneralCode, { shouldValidate: true })
    }
    if (providerProduct) {
      form.setValue('code', providerProduct.product_code, { shouldValidate: true })
      form.setValue('is_closed_amount', providerProduct.is_closed_amount, { shouldValidate: true })
      form.setValue(
        'denomination_amount',
        'close_amount' in providerProduct ? providerProduct.close_amount : undefined,
        { shouldValidate: true },
      )
    }
  }

  const handleProviderChange = (value: string) => {
    const provider = value as SmartVaProvider
    form.setValue('provider', provider, { shouldValidate: true })
    const gateway = VA_PRODUCT_CODES.find((item) => item.gateway_code === provider)
    const currentProductName = form.getValues('product_name')
    const product =
      gateway?.data_products.find((item) => item.product_name === currentProductName) ??
      gateway?.data_products[0]
    if (product) applyCatalogProduct(provider, product.product_name)
  }

  const onSubmit = async (values: VaProductFormValues) => {
    setIsLoading(true)
    try {
      const payload: CreateVaProductRequest = {
        provider: values.provider,
        product_name: values.product_name,
        code: values.code,
        routing_priority: values.routing_priority,
        is_routing_active: values.is_routing_active,
        is_closed_amount: values.is_closed_amount,
        fee_amount: values.fee_amount,
      }

      if (values.general_code) payload.general_code = values.general_code
      if (values.denomination_amount !== undefined) {
        payload.denomination_amount = values.denomination_amount
      }
      if (values.min_amount !== undefined) payload.min_amount = values.min_amount
      if (values.max_amount !== undefined) payload.max_amount = values.max_amount

      const result =
        isEdit && vaProduct
          ? await updateVaProduct(vaProduct.id, payload as UpdateVaProductRequest)
          : await createVaProduct(payload)

      if (!result.success) {
        toast.error(result.message || 'Failed to save VA Product')
        return
      }

      toast.success(isEdit ? 'VA Product updated successfully' : 'VA Product created successfully')
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputError = (field: keyof VaProductFormValues) =>
    form.formState.errors[field]?.message?.toString()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit VA Product' : 'Add New VA Product'}</DialogTitle>
          <DialogDescription>
            Configure the provider product and its Smart VA routing eligibility.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <select
                value={selectedProvider}
                onChange={(event) => handleProviderChange(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SMART_VA_PROVIDERS.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <select
                value={selectedProductName}
                onChange={(event) => applyCatalogProduct(selectedProvider, event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {productNameOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {inputError('product_name') && (
                <p className="text-xs text-destructive">{inputError('product_name')}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provider Code</label>
              <Input {...form.register('code')} placeholder="e.g. DANAPLUS" />
              {inputError('code') && <p className="text-xs text-destructive">{inputError('code')}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fee Amount</label>
              <Input type="number" min="0" step="any" {...form.register('fee_amount', { valueAsNumber: true })} />
              {inputError('fee_amount') && (
                <p className="text-xs text-destructive">{inputError('fee_amount')}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
            <div>
              <h3 className="font-medium">Smart VA Routing</h3>
              <p className="text-xs text-muted-foreground">
                Lower priority values are preferred among active and eligible routes.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">General Product</label>
                <select
                  {...form.register('general_code')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Not routed</option>
                  {SMART_VA_GENERAL_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Routing Priority</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  {...form.register('routing_priority', { valueAsNumber: true })}
                />
                {inputError('routing_priority') && (
                  <p className="text-xs text-destructive">{inputError('routing_priority')}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Denomination Amount</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Optional exact amount"
                  {...form.register('denomination_amount', { setValueAs: optionalNumberInput })}
                />
                {inputError('denomination_amount') && (
                  <p className="text-xs text-destructive">{inputError('denomination_amount')}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    aria-label="Minimum amount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Minimum"
                    {...form.register('min_amount', { setValueAs: optionalNumberInput })}
                  />
                  <Input
                    aria-label="Maximum amount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Maximum"
                    {...form.register('max_amount', { setValueAs: optionalNumberInput })}
                  />
                </div>
                {(inputError('min_amount') || inputError('max_amount')) && (
                  <p className="text-xs text-destructive">
                    {inputError('min_amount') || inputError('max_amount')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-md border bg-background p-3 text-sm font-medium">
                <Switch
                  checked={isClosedAmount}
                  onCheckedChange={(checked) =>
                    form.setValue('is_closed_amount', checked, { shouldValidate: true })
                  }
                />
                Closed denomination
              </label>
              <label className="flex items-center gap-3 rounded-md border bg-background p-3 text-sm font-medium">
                <Switch
                  checked={isRoutingActive}
                  onCheckedChange={(checked) =>
                    form.setValue('is_routing_active', checked, { shouldValidate: true })
                  }
                />
                Routing active
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
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
