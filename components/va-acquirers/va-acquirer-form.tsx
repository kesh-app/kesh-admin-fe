'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { VaAcquirer } from '@/types/va-acquirer.type'
import { createVaAcquirer, updateVaAcquirer } from '@/app/dashboard/va-acquirers/actions'
import { Eye, EyeOff } from 'lucide-react'

const getVaAcquirerSchema = (isEdit: boolean) => {
  const requiredString = z.string().min(1, 'Required')
  const optionalString = z.string().optional().or(z.literal(''))

  return z.object({
    name: isEdit ? optionalString : requiredString,
    provider: isEdit ? optionalString : requiredString,
    service_type: isEdit ? optionalString : requiredString,
    client_id: isEdit ? optionalString : requiredString,
    secret_id: isEdit ? optionalString : requiredString,
    partner_id: isEdit ? optionalString : requiredString,
    merchant_id: isEdit ? optionalString : requiredString,
    private_key: isEdit ? optionalString : requiredString,
    public_key: optionalString,
    endpoint: isEdit 
      ? z.string().url('Invalid endpoint URL').optional().or(z.literal(''))
      : z.string().url('Invalid endpoint URL'),
    partner_service_id: isEdit ? optionalString : requiredString,
    source_account_no: isEdit ? optionalString : requiredString,
    source_bank_code: isEdit ? optionalString : requiredString,
    is_status: z.boolean(),
  })
}

type VaAcquirerFormValues = z.infer<ReturnType<typeof getVaAcquirerSchema>>

interface VaAcquirerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaAcquirer?: VaAcquirer | null
}

export default function VaAcquirerForm({ open, onOpenChange, vaAcquirer }: VaAcquirerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!vaAcquirer

  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({
    client_id: false,
    secret_id: false,
    partner_id: false,
    private_key: false,
    public_key: false,
  })

  const formSchema = getVaAcquirerSchema(isEdit)
  const form = useForm<VaAcquirerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      provider: '',
      service_type: '',
      client_id: '',
      secret_id: '',
      partner_id: '',
      merchant_id: '',
      private_key: '',
      public_key: '',
      endpoint: '',
      partner_service_id: '',
      source_account_no: '',
      source_bank_code: '',
      is_status: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: vaAcquirer?.name || '',
        provider: vaAcquirer?.provider || '',
        service_type: vaAcquirer?.service_type || '',
        client_id: vaAcquirer?.client_id || '',
        secret_id: vaAcquirer?.secret_id || '',
        partner_id: vaAcquirer?.partner_id || '',
        merchant_id: vaAcquirer?.merchant_id || '',
        private_key: vaAcquirer?.private_key || '',
        public_key: vaAcquirer?.public_key || '',
        endpoint: vaAcquirer?.endpoint || '',
        partner_service_id: vaAcquirer?.partner_service_id || '',
        source_account_no: vaAcquirer?.source_account_no || '',
        source_bank_code: vaAcquirer?.source_bank_code || '',
        is_status: vaAcquirer?.is_status ?? true,
      })
    }
  }, [open, vaAcquirer, form])

  const toggleVisibility = (field: string) => {
    setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const onSubmit = async (values: VaAcquirerFormValues) => {
    setIsLoading(true)
    try {
      let result
      if (isEdit && vaAcquirer) {
        result = await updateVaAcquirer(vaAcquirer.id, values)
      } else {
        result = await createVaAcquirer(values as import('@/types/va-acquirer.type').CreateVaAcquirerRequest)
      }

      if (result.success) {
        toast.success(isEdit ? 'VA acquirer updated successfully' : 'VA acquirer created successfully')
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const FormField = ({ label, name, isSensitive = false, placeholder = '', type = 'input' }: {
    label: string,
    name: keyof VaAcquirerFormValues,
    isSensitive?: boolean,
    placeholder?: string,
    type?: 'input' | 'textarea'
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {isSensitive && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => toggleVisibility(name)}
          >
            {showSensitive[name] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        )}
      </div>
      <div className="relative">
        {type === 'textarea' ? (
          <Textarea
            {...form.register(name)}
            placeholder={placeholder}
            style={{ WebkitTextSecurity: isSensitive && !showSensitive[name] ? 'disc' : 'none' } as React.CSSProperties}
            className={`font-mono text-xs min-h-[150px] ${
              form.formState.errors[name] ? 'border-destructive' : ''
            }`}
          />
        ) : (
          <Input
            {...form.register(name)}
            type="text"
            placeholder={placeholder}
            autoComplete="off"
            style={{ WebkitTextSecurity: isSensitive && !showSensitive[name] ? 'disc' : 'none' } as React.CSSProperties}
            className={form.formState.errors[name] ? 'border-destructive' : ''}
          />
        )}
        {form.formState.errors[name] && (
          <p className="text-xs text-destructive mt-1">{form.formState.errors[name]?.message}</p>
        )}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit VA Acquirer' : 'Add New VA Acquirer'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this VA acquirer.'
              : 'Enter the details for the new VA acquirer integration.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Name" name="name" placeholder="e.g. NOBU_VA_CASHOUT" />
            <FormField label="Provider" name="provider" placeholder="e.g. NOBU" />
            <FormField label="Service Type" name="service_type" placeholder="e.g. CASH_OUT" />
            <FormField label="Merchant ID" name="merchant_id" placeholder="Merchant ID" />
            
            <FormField label="Client ID" name="client_id" isSensitive placeholder="Client ID" />
            <FormField label="Secret ID" name="secret_id" isSensitive placeholder="Secret ID" />
            <FormField label="Partner ID" name="partner_id" isSensitive placeholder="Partner ID" />
            <FormField label="Endpoint" name="endpoint" placeholder="https://sandbox-api.nobubank.com" />
            
            <FormField label="Partner Service ID" name="partner_service_id" placeholder="e.g. 088899" />
            <FormField label="Source Account No" name="source_account_no" placeholder="e.g. 10110889307" />
            <FormField label="Source Bank Code" name="source_bank_code" placeholder="e.g. 002" />

            <div className="space-y-2 flex items-center md:col-span-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_status"
                  checked={form.watch('is_status')}
                  onCheckedChange={(checked) => form.setValue('is_status', checked, { shouldValidate: true })}
                />
                <label htmlFor="is_status" className="text-sm font-medium">Active Status</label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Private Key"
              name="private_key"
              type="textarea"
              isSensitive
              placeholder="-----BEGIN PRIVATE KEY-----..."
            />
            <FormField
              label="Public Key"
              name="public_key"
              type="textarea"
              isSensitive
              placeholder="-----BEGIN PUBLIC KEY-----..."
            />
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
              {isLoading ? 'Saving...' : isEdit ? 'Update VA Acquirer' : 'Add VA Acquirer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
