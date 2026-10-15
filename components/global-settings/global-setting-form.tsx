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
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { GlobalSetting } from '@/types/global-setting.type'
import { createGlobalSetting, updateGlobalSetting } from '@/app/dashboard/global-settings/actions'

// --- Schema ---

const settingSchema = z.object({
  type: z
    .string()
    .min(1, 'Type is required')
    .regex(/^[A-Z0-9_]+$/, 'Only uppercase letters, numbers, or underscores'),
  name: z.string().min(1, 'Name is required'),
  value: z.string().optional(),
  additional_data: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
})

type SettingFormValues = z.infer<typeof settingSchema>

function recordToEntries(data: Record<string, string> | null): { key: string; value: string }[] {
  if (!data) return []
  return Object.entries(data).map(([key, value]) => ({ key, value }))
}

function entriesToRecord(entries: { key: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(entries.map((e) => [e.key, e.value]))
}

// --- Component ---

interface GlobalSettingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  setting?: GlobalSetting | null
  existingTypes?: string[]
}

export default function GlobalSettingForm({
  open,
  onOpenChange,
  setting,
  existingTypes = [],
}: GlobalSettingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})
  const isEdit = !!setting

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      type: '',
      name: '',
      value: '',
      additional_data: [],
    },
  })

  const watchedType = form.watch('type')
  const additionalFields = form.watch('additional_data') || []
  const isSwagger = (setting?.type || watchedType) === 'SWAGGER'

  // Reset form on open / setting change
  useEffect(() => {
    if (open) {
      const isSwaggerSetting = setting?.type === 'SWAGGER'
      let additionalDataEntries = recordToEntries(setting?.additional_data || null)

      if (isSwaggerSetting) {
        // For SWAGGER: only username and password, password input empty on edit
        const existingUsername = setting?.additional_data?.username || ''
        additionalDataEntries = [
          { key: 'username', value: existingUsername },
          { key: 'password', value: '' },
        ]
      }

      form.reset({
        type: setting?.type || '',
        name: setting?.name || '',
        value: setting?.value || '',
        additional_data: additionalDataEntries,
      })
      setShowSensitive({})
    }
  }, [open, setting, form])

  const toggleSensitive = (key: string) =>
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }))

  const addCustomField = () => {
    form.setValue('additional_data', [...additionalFields, { key: '', value: '' }])
  }

  const removeField = (index: number) => {
    const updated = [...additionalFields]
    updated.splice(index, 1)
    form.setValue('additional_data', updated)
  }

  const updateField = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...additionalFields]
    updated[index] = { ...updated[index], [field]: val }
    form.setValue('additional_data', updated)
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upper = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')
    form.setValue('type', upper, { shouldValidate: true })
  }

  const isDuplicateType =
    !isEdit &&
    watchedType.length > 0 &&
    (existingTypes.map((t) => t.toUpperCase()).includes(watchedType.toUpperCase()) ||
      watchedType.toUpperCase() === 'SWAGGER')

  const onSubmit = async (values: SettingFormValues) => {
    if (!isEdit && values.type.toUpperCase() === 'SWAGGER') {
      form.setError('type', {
        type: 'manual',
        message: 'Type "SWAGGER" cannot be created manually',
      })
      return
    }

    if (isDuplicateType) {
      form.setError('type', { type: 'manual', message: `Type "${values.type}" is already in use` })
      return
    }

    setIsLoading(true)
    try {
      let finalAdditionalData: Record<string, string> | undefined

      if (isSwagger && isEdit) {
        const usernameEntry = values.additional_data?.find((e) => e.key === 'username')
        const passwordEntry = values.additional_data?.find((e) => e.key === 'password')

        finalAdditionalData = {
          ...(setting?.additional_data || {}),
          username: usernameEntry?.value ?? setting?.additional_data?.username ?? '',
        }

        // Only include password if user typed a new password (not empty)
        if (passwordEntry?.value && passwordEntry.value.trim() !== '') {
          finalAdditionalData.password = passwordEntry.value
        }
      } else if (values.additional_data && values.additional_data.length > 0) {
        finalAdditionalData = entriesToRecord(
          values.additional_data.filter((e) => e.key.trim() !== '')
        )
      }

      const payload = {
        type: values.type,
        name: values.name,
        value: values.value || undefined,
        additional_data: finalAdditionalData,
      }

      const result =
        isEdit && setting
          ? await updateGlobalSetting(setting.id, payload)
          : await createGlobalSetting(payload)

      if (result.success) {
        toast.success(isEdit ? 'Setting updated successfully' : 'Setting created successfully')
        onOpenChange(false)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Setting' : 'Add New Setting'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the configuration for this global setting.'
              : 'Configure a new global setting for the application.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4" autoComplete="off">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type</label>
            {isEdit ? (
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono text-muted-foreground">
                {setting?.type}
              </div>
            ) : (
              <>
                <Input
                  value={watchedType}
                  onChange={handleTypeChange}
                  placeholder="e.g. SWAGGER"
                  autoComplete="off"
                  className={`font-mono ${
                    form.formState.errors.type || isDuplicateType ? 'border-destructive' : ''
                  }`}
                />
                {/* Duplicate warning */}
                {isDuplicateType && (
                  <p className="text-xs text-destructive font-medium">
                    ⚠ Type &quot;{watchedType}&quot; is already in use
                  </p>
                )}
                {/* Zod error (non-duplicate) */}
                {form.formState.errors.type && !isDuplicateType && (
                  <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
                )}
                {/* Hint: show existing types when field is empty */}
                {!watchedType && existingTypes.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Already used:{' '}
                    {existingTypes.map((t, i) => (
                      <span key={t}>
                        <span className="font-mono font-medium">{t}</span>
                        {i < existingTypes.length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input
              {...form.register('name')}
              placeholder="e.g. Swagger Credentials"
              className={form.formState.errors.name ? 'border-destructive' : ''}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Value (optional) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Value <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <Input {...form.register('value')} placeholder="Optional string value" />
          </div>

          {/* Additional Data */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Additional Data{' '}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
            </div>

            {isSwagger ? (
              <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Username</label>
                  <Input
                    value={additionalFields.find((f) => f.key === 'username')?.value || ''}
                    onChange={(e) => {
                      const idx = additionalFields.findIndex((f) => f.key === 'username')
                      if (idx >= 0) {
                        updateField(idx, 'value', e.target.value)
                      } else {
                        form.setValue('additional_data', [
                          ...additionalFields,
                          { key: 'username', value: e.target.value },
                        ])
                      }
                    }}
                    placeholder="Enter username"
                    className="font-mono text-xs"
                    autoComplete="off"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Password {isEdit && <span className="text-[11px] text-muted-foreground/80">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <Input
                      type={showSensitive['password'] ? 'text' : 'password'}
                      value={additionalFields.find((f) => f.key === 'password')?.value || ''}
                      onChange={(e) => {
                        const idx = additionalFields.findIndex((f) => f.key === 'password')
                        if (idx >= 0) {
                          updateField(idx, 'value', e.target.value)
                        } else {
                          form.setValue('additional_data', [
                            ...additionalFields,
                            { key: 'password', value: e.target.value },
                          ])
                        }
                      }}
                      placeholder={isEdit ? 'Enter new password to change' : 'Enter password'}
                      autoComplete="new-password"
                      className="pr-8 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSensitive('password')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSensitive['password'] ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 rounded-md border p-3 bg-muted/30">
                {additionalFields.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No fields added yet
                  </p>
                )}

                {additionalFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {/* Key */}
                    <Input
                      value={field.key}
                      onChange={(e) => updateField(index, 'key', e.target.value)}
                      placeholder="key"
                      className="flex-1 min-w-0 font-mono text-xs"
                    />

                    {/* Value */}
                    <div className="relative flex-[2] min-w-0">
                      <Input
                        value={field.value}
                        onChange={(e) => updateField(index, 'value', e.target.value)}
                        placeholder="value"
                        autoComplete="off"
                        style={
                          showSensitive[field.key] === false || field.key.toLowerCase().includes('password') || field.key.toLowerCase().includes('secret')
                            ? ({ WebkitTextSecurity: showSensitive[field.key] ? 'none' : 'disc' } as React.CSSProperties)
                            : undefined
                        }
                        className="pr-8 font-mono text-xs"
                      />
                      {(field.key.toLowerCase().includes('password') ||
                        field.key.toLowerCase().includes('secret') ||
                        field.key.toLowerCase().includes('token')) && (
                        <button
                          type="button"
                          onClick={() => toggleSensitive(field.key)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showSensitive[field.key] ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Remove */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <div className="pt-1 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground h-7"
                    onClick={addCustomField}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add field
                  </Button>
                </div>
              </div>
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
            <Button type="submit" disabled={isLoading || isDuplicateType}>
              {isLoading ? 'Saving...' : isEdit ? 'Update Setting' : 'Add Setting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
