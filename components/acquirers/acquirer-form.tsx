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
import { Acquirer } from '@/types/acquirer.type'
import { createAcquirer, updateAcquirer } from '@/app/dashboard/acquirers/actions'
import { Eye, EyeOff } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const acquirerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  merchant_id: z.string().min(1, 'Merchant ID is required'),
  client_id: z.string().min(1, 'Client ID is required'),
  secret_id: z.string().min(1, 'Secret ID is required'),
  partner_id: z.string().min(1, 'Partner ID is required'),
  private_key: z.string().min(1, 'Private Key is required'),
  endpoint: z.string().url('Invalid endpoint URL'),
  is_status: z.boolean().optional(),
})

type AcquirerFormValues = z.infer<typeof acquirerSchema>

interface AcquirerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  acquirer?: Acquirer | null
}

export default function AcquirerForm({ open, onOpenChange, acquirer }: AcquirerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!acquirer

  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({
    client_id: false,
    secret_id: false,
    partner_id: false,
    private_key: false,
  })

  const form = useForm<AcquirerFormValues>({
    resolver: zodResolver(acquirerSchema),
    defaultValues: {
      name: '',
      merchant_id: '',
      client_id: '',
      secret_id: '',
      partner_id: '',
      private_key: '',
      endpoint: '',
      is_status: true,
    },
  })

  // Reset form when acquirer changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: acquirer?.name || '',
        merchant_id: acquirer?.merchant_id || '',
        client_id: acquirer?.client_id || '',
        secret_id: acquirer?.secret_id || '',
        partner_id: acquirer?.partner_id || '',
        private_key: acquirer?.private_key || '',
        endpoint: acquirer?.endpoint || '',
        is_status: acquirer?.is_status ?? true,
      })
    }
  }, [open, acquirer, form])

  const toggleVisibility = (field: string) => {
    setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const onSubmit = async (values: AcquirerFormValues) => {
    setIsLoading(true)
    try {
      let result
      if (isEdit && acquirer) {
        result = await updateAcquirer(acquirer.id, values as any)
      } else {
        result = await createAcquirer(values as any)
      }

      if (result.success) {
        toast.success(isEdit ? 'Acquirer updated successfully' : 'Acquirer created successfully')
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
    name: keyof AcquirerFormValues,
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
          <DialogTitle>{isEdit ? 'Edit Acquirer' : 'Add New Acquirer'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this payment acquirer.'
              : 'Enter the details for the new payment acquirer integration.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Name" name="name" placeholder="e.g. NOBU" />
            <FormField label="Merchant ID" name="merchant_id" placeholder="e.g. MID-123" />
            <FormField label="Client ID" name="client_id" isSensitive placeholder="Client ID" />
            <FormField label="Secret ID" name="secret_id" isSensitive placeholder="Secret ID" />
            <FormField label="Partner ID" name="partner_id" isSensitive placeholder="Partner ID" />
            <FormField label="Endpoint" name="endpoint" placeholder="https://api.example.id" />
          </div>

          <FormField 
            label="Private Key" 
            name="private_key" 
            type="textarea" 
            isSensitive 
            placeholder="-----BEGIN PRIVATE KEY-----..." 
          />

          {isEdit && (
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_status"
                checked={form.watch('is_status')}
                onCheckedChange={(checked: boolean) => form.setValue('is_status', !!checked)}
              />
              <label
                htmlFor="is_status"
                className="text-sm font-medium leading-none"
              >
                Active Status
              </label>
            </div>
          )}

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
              {isLoading ? 'Saving...' : isEdit ? 'Update Acquirer' : 'Add Acquirer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
