'use client'

import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Eye, EyeOff, MoreHorizontal, Pencil, Settings2, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClientDate } from '@/components/client-date'
import { GlobalSetting } from '@/types/global-setting.type'
import { deleteGlobalSetting, getGlobalSettingById } from '@/app/dashboard/global-settings/actions'
import GlobalSettingForm from './global-setting-form'

interface GlobalSettingCardsProps {
  settings: GlobalSetting[]
  existingTypes: string[]
}

const TYPE_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  SWAGGER: 'default',
}

const SENSITIVE_KEYS = ['password', 'secret', 'token', 'key', 'private']

function AdditionalDataViewer({ data }: { data: Record<string, string> | null }) {
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  if (!data || Object.keys(data).length === 0) {
    return <p className="text-xs text-muted-foreground italic">No additional data</p>
  }

  const isSensitive = (key: string) =>
    SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))

  const toggleVisibility = (key: string) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-1.5">
      {Object.entries(data).map(([key, value]) => {
        const sensitive = isSensitive(key)
        const shown = visible[key]

        return (
          <div key={key} className="flex items-center gap-2 group">
            <span className="text-xs font-medium text-muted-foreground w-24 shrink-0 truncate">
              {key}:
            </span>
            <span
              className="text-xs font-mono truncate flex-1"
              style={
                sensitive && !shown
                  ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties)
                  : undefined
              }
            >
              {value}
            </span>
            {sensitive && (
              <button
                onClick={() => toggleVisibility(key)}
                className="shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {shown ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function GlobalSettingCards({ settings, existingTypes }: GlobalSettingCardsProps) {
  const [editingSetting, setEditingSetting] = useState<GlobalSetting | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GlobalSetting | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = async (setting: GlobalSetting) => {
    toast.loading('Fetching details...', { id: 'fetch-setting' })
    const result = await getGlobalSettingById(setting.id)
    toast.dismiss('fetch-setting')

    if (result.success && result.data) {
      setEditingSetting(result.data)
      setIsFormOpen(true)
    } else {
      toast.error(result.message || 'Failed to fetch details')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteGlobalSetting(deleteTarget.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success('Setting deleted successfully')
      setDeleteTarget(null)
    } else {
      toast.error(result.message || 'Failed to delete setting')
    }
  }

  if (settings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Settings2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground font-medium">No global settings found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Add a new setting to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="columns-1 md:columns-2 xl:columns-3 gap-4 [column-fill:_balance]">
        {settings.map((setting) => (
          <Card key={setting.id} className="break-inside-avoid mb-4 flex flex-col shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Settings2 className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{setting.name}</p>
                  <Badge
                    variant={TYPE_BADGE_VARIANT[setting.type] || 'secondary'}
                    className="mt-1 text-[10px] px-1.5 py-0"
                  >
                    {setting.type}
                  </Badge>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleEdit(setting)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {setting.type !== 'SWAGGER' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(setting)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 flex-1">
              {/* Value */}
              {setting.value && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                    Value
                  </p>
                  <p className="text-xs font-mono bg-muted rounded px-2 py-1 truncate">
                    {setting.value}
                  </p>
                </div>
              )}

              {/* Additional Data */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                  Additional Data
                </p>
                <div className="bg-muted/50 rounded-md px-2.5 py-2">
                  <AdditionalDataViewer data={setting.additional_data} />
                </div>
              </div>

              {/* Timestamps */}
              <div className="mt-auto pt-2 border-t border-border/50 flex justify-between text-[10px] text-muted-foreground">
                <span>
                  Created <ClientDate date={setting.created_at} format="dd MMM yyyy" />
                </span>
                <span>
                  Updated <ClientDate date={setting.updated_at} format="dd MMM yyyy" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Form */}
      <GlobalSettingForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        setting={editingSetting}
        existingTypes={existingTypes}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Setting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
