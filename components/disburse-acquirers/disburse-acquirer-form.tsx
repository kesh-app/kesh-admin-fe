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
import { DisburseAcquirer } from '@/types/disburse-acquirer.type'
import { createDisburseAcquirer, updateDisburseAcquirer } from '@/app/dashboard/disburse-acquirers/actions'
import { Eye, EyeOff } from 'lucide-react'

const disburseAcquirerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  merchant_id: z.string().min(1, 'Merchant ID is required'),
  client_id: z.string().min(1, 'Client ID is required'),
  secret_id: z.string().min(1, 'Secret ID is required'),
  partner_id: z.string().min(1, 'Partner ID is required'),
  private_key: z.string().min(1, 'Private Key is required'),
  endpoint: z.string().url('Invalid endpoint URL'),
  source_account_no: z.string().min(1, 'Source Account No is required'),
})

type DisburseAcquirerFormValues = z.infer<typeof disburseAcquirerSchema>

interface DisburseAcquirerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  disburseAcquirer?: DisburseAcquirer | null
}

export default function DisburseAcquirerForm({ open, onOpenChange, disburseAcquirer }: DisburseAcquirerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!disburseAcquirer

  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({
    client_id: false,
    secret_id: false,
    partner_id: false,
    private_key: false,
  })

  const form = useForm<DisburseAcquirerFormValues>({
    resolver: zodResolver(disburseAcquirerSchema),
    defaultValues: {
      name: '',
      type: '',
      merchant_id: '',
      client_id: '',
      secret_id: '',
      partner_id: '',
      private_key: '',
      endpoint: '',
      source_account_no: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: disburseAcquirer?.name || '',
        type: disburseAcquirer?.type || '',
        merchant_id: disburseAcquirer?.merchant_id || '',
        client_id: disburseAcquirer?.client_id || '',
        secret_id: disburseAcquirer?.secret_id || '',
        partner_id: disburseAcquirer?.partner_id || '',
        private_key: disburseAcquirer?.private_key || '',
        endpoint: disburseAcquirer?.endpoint || '',
        source_account_no: disburseAcquirer?.source_account_no || '',
      })
    }
  }, [open, disburseAcquirer, form])

  const toggleVisibility = (field: string) => {
    setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const onSubmit = async (values: DisburseAcquirerFormValues) => {
    setIsLoading(true)
    try {
      let result
      if (isEdit && disburseAcquirer) {
        result = await updateDisburseAcquirer(disburseAcquirer.id, values)
      } else {
        result = await createDisburseAcquirer(values)
      }

      if (result.success) {
        toast.success(isEdit ? 'Disburse acquirer updated successfully' : 'Disburse acquirer created successfully')
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
    name: keyof DisburseAcquirerFormValues,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Disburse Acquirer' : 'Add New Disburse Acquirer'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this disburse acquirer.'
              : 'Enter the details for the new disburse acquirer integration.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Name" name="name" placeholder="e.g. NOBU_RTOL" />
            <FormField label="Type" name="type" placeholder="e.g. NOBU" />
            <FormField label="Merchant ID" name="merchant_id" placeholder="e.g. 936005030000081984" />
            <FormField label="Endpoint" name="endpoint" placeholder="https://sandbox-api.nobubank.com" />
            <FormField label="Client ID" name="client_id" isSensitive placeholder="Client ID" />
            <FormField label="Secret ID" name="secret_id" isSensitive placeholder="Secret ID" />
            <FormField label="Partner ID" name="partner_id" isSensitive placeholder="Partner ID" />
            <FormField label="Source Account No" name="source_account_no" placeholder="e.g. 1234567890" />
          </div>

          <FormField
            label="Private Key"
            name="private_key"
            type="textarea"
            isSensitive
            placeholder="-----BEGIN PRIVATE KEY-----..."
          />

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
              {isLoading ? 'Saving...' : isEdit ? 'Update Disburse Acquirer' : 'Add Disburse Acquirer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
