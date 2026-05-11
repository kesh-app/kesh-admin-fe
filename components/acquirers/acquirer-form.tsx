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
import { Checkbox } from '@/components/ui/checkbox'
import { Acquirer } from '@/types/acquirer.type'
import { createAcquirer, updateAcquirer } from '@/app/dashboard/acquirers/actions'

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-width-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Acquirer' : 'Add New Acquirer'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this payment acquirer.'
              : 'Enter the details for the new payment acquirer integration.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                {...form.register('name')}
                placeholder="e.g. NOBU"
                className={form.formState.errors.name ? 'border-destructive' : ''}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Merchant ID</label>
              <Input
                {...form.register('merchant_id')}
                placeholder="e.g. MID-123"
                className={form.formState.errors.merchant_id ? 'border-destructive' : ''}
              />
              {form.formState.errors.merchant_id && (
                <p className="text-xs text-destructive">{form.formState.errors.merchant_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Client ID</label>
              <Input
                {...form.register('client_id')}
                placeholder="Client ID"
                className={form.formState.errors.client_id ? 'border-destructive' : ''}
              />
              {form.formState.errors.client_id && (
                <p className="text-xs text-destructive">{form.formState.errors.client_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Secret ID</label>
              <Input
                {...form.register('secret_id')}
                placeholder="Secret ID"
                className={form.formState.errors.secret_id ? 'border-destructive' : ''}
              />
              {form.formState.errors.secret_id && (
                <p className="text-xs text-destructive">{form.formState.errors.secret_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Partner ID</label>
              <Input
                {...form.register('partner_id')}
                placeholder="Partner ID"
                className={form.formState.errors.partner_id ? 'border-destructive' : ''}
              />
              {form.formState.errors.partner_id && (
                <p className="text-xs text-destructive">{form.formState.errors.partner_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Endpoint</label>
              <Input
                {...form.register('endpoint')}
                placeholder="https://api.example.id"
                className={form.formState.errors.endpoint ? 'border-destructive' : ''}
              />
              {form.formState.errors.endpoint && (
                <p className="text-xs text-destructive">{form.formState.errors.endpoint.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Private Key</label>
            <Textarea
              {...form.register('private_key')}
              placeholder="-----BEGIN PRIVATE KEY-----..."
              className={`font-mono text-xs min-h-[150px] ${
                form.formState.errors.private_key ? 'border-destructive' : ''
              }`}
            />
            {form.formState.errors.private_key && (
              <p className="text-xs text-destructive">{form.formState.errors.private_key.message}</p>
            )}
          </div>

          {isEdit && (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="is_status"
                checked={form.watch('is_status')}
                onCheckedChange={(checked) => form.setValue('is_status', !!checked)}
              />
              <label
                htmlFor="is_status"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
