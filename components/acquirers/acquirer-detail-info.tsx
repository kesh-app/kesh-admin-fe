'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Save, ShieldCheck } from 'lucide-react'
import { Acquirer } from '@/types/acquirer.type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { updateAcquirer, updateAcquirerStatus } from '@/app/dashboard/acquirers/actions'
import { Switch } from '../ui/switch'

const acquirerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  merchant_id: z.string().min(1, 'Merchant ID is required'),
  client_id: z.string().min(1, 'Client ID is required'),
  secret_id: z.string().min(1, 'Secret ID is required'),
  partner_id: z.string().min(1, 'Partner ID is required'),
  private_key: z.string().min(1, 'Private Key is required'),
  endpoint: z.string().url('Invalid endpoint URL'),
})

type AcquirerFormValues = z.infer<typeof acquirerSchema>

interface AcquirerDetailInfoProps {
  acquirer: Acquirer
}

export default function AcquirerDetailInfo({ acquirer }: AcquirerDetailInfoProps) {
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({
    client_id: false,
    secret_id: false,
    partner_id: false,
    private_key: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isStatusLoading, setIsStatusLoading] = useState(false)

  const form = useForm<AcquirerFormValues>({
    resolver: zodResolver(acquirerSchema),
    defaultValues: {
      name: acquirer.name,
      merchant_id: acquirer.merchant_id,
      client_id: acquirer.client_id,
      secret_id: acquirer.secret_id,
      partner_id: acquirer.partner_id,
      private_key: acquirer.private_key,
      endpoint: acquirer.endpoint,
    },
  })

  const toggleVisibility = (field: string) => {
    setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const onSubmit = async (values: AcquirerFormValues) => {
    setIsLoading(true)
    try {
      const result = await updateAcquirer(acquirer.id, { ...values, is_status: acquirer.is_status })
      if (result.success) {
        toast.success('Acquirer configuration updated successfully')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to update configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (checked: boolean) => {
    setIsStatusLoading(true)
    try {
      const result = await updateAcquirerStatus(acquirer.id, checked)
      if (result.success) {
        toast.success(`Acquirer ${checked ? 'enabled' : 'disabled'} successfully`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsStatusLoading(false)
    }
  }

  const FormField = ({ label, name, isSensitive = false, type = 'input' }: { 
    label: string, 
    name: keyof AcquirerFormValues,
    isSensitive?: boolean,
    type?: 'input' | 'textarea'
  }) => (
    <div className="flex flex-col space-y-1 py-2">
      <div className="flex items-center justify-between group">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
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
            style={{ WebkitTextSecurity: isSensitive && !showSensitive[name] ? 'disc' : 'none' } as React.CSSProperties}
            className={`font-mono text-[10px] bg-muted/30 min-h-[120px] leading-tight ${
              form.formState.errors[name] ? 'border-destructive' : ''
            }`}
          />
        ) : (
          <Input
            {...form.register(name)}
            type="text"
            autoComplete="off"
            style={{ WebkitTextSecurity: isSensitive && !showSensitive[name] ? 'disc' : 'none' } as React.CSSProperties}
            className={`font-mono text-sm bg-muted/30 h-9 ${
              form.formState.errors[name] ? 'border-destructive' : ''
            }`}
          />
        )}
        {form.formState.errors[name] && (
          <p className="text-[10px] text-destructive mt-1">{form.formState.errors[name]?.message}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-primary/30 p-3 rounded-lg border border-primary/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Control</p>
            <p className="text-sm font-medium">Acquirer is currently {acquirer.is_status ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            id="status-toggle"
            checked={acquirer.is_status} 
            onCheckedChange={(checked: boolean) => handleToggleStatus(checked)}
            disabled={isStatusLoading}
          />
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <FormField label="Acquirer Name" name="name" />
          <FormField label="Merchant ID" name="merchant_id" />
          <FormField label="Endpoint" name="endpoint" />
          <FormField label="Client ID" name="client_id" isSensitive />
          <FormField label="Secret ID" name="secret_id" isSensitive />
          <FormField label="Partner ID" name="partner_id" isSensitive />
          <div className="md:col-span-2">
            <FormField label="Private Key" name="private_key" type="textarea" isSensitive />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={isLoading} size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving Changes...' : 'Update Configuration'}
          </Button>
        </div>
      </form>
    </div>
  )
}
