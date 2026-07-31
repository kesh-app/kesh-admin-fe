'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Role, Permission, AssignPermissionsPayload } from '@/types/role-permission.type'
import { assignRolePermissionsAction } from '@/app/dashboard/role-permissions/actions'
import { toast } from 'sonner'
import { KeyRound, Search, CheckSquare, Square, Check } from 'lucide-react'

interface AssignPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  permissions: Permission[]
  onSuccess: () => void
}

export function AssignPermissionsDialog({
  open,
  onOpenChange,
  role,
  permissions,
  onSuccess,
}: AssignPermissionsDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset state strictly when dialog opens or when role ID changes
  useEffect(() => {
    if (open && role) {
      setSelectedPermissions(role.permissions || [])
      setSearchQuery('')
    }
  }, [open, role?.id])

  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {}
    const searchLower = searchQuery.toLowerCase().trim()

    const filtered = permissions.filter((p) => {
      if (!searchLower) return true
      return (
        p.name.toLowerCase().includes(searchLower) ||
        p.code.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      )
    })

    filtered.forEach((p) => {
      const category = p.code.includes('.') ? p.code.split('.')[0].toUpperCase() : 'OTHER'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(p)
    })

    return groups
  }, [permissions, searchQuery])

  const togglePermission = useCallback((permCode: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permCode)
        ? prev.filter((c) => c !== permCode)
        : [...prev, permCode]
    )
  }, [])

  const toggleGroupPermissions = useCallback((groupPerms: Permission[]) => {
    const groupCodes = groupPerms.map((p) => p.code)
    setSelectedPermissions((prev) => {
      const allSelected = groupCodes.every((c) => prev.includes(c))
      if (allSelected) {
        return prev.filter((c) => !groupCodes.includes(c))
      } else {
        return Array.from(new Set([...prev, ...groupCodes]))
      }
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedPermissions(permissions.map((p) => p.code))
  }, [permissions])

  const clearAll = useCallback(() => {
    setSelectedPermissions([])
  }, [])

  const handleSave = async () => {
    if (!role) return

    setLoading(true)
    try {
      const payload: AssignPermissionsPayload = {
        permission_codes: selectedPermissions,
      }

      const res = await assignRolePermissionsAction(role.id, payload)
      if (res.success) {
        toast.success(res.message || 'Permissions updated successfully')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update permissions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <KeyRound className="h-5 w-5 text-primary" />
            Manage Permissions: {role?.name}
          </DialogTitle>
          <DialogDescription>
            Select or unselect permission codes assigned to role{' '}
            <span className="font-mono font-semibold text-foreground">{role?.code}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="px-6 pt-4 pb-2 space-y-3 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedPermissions.length}</span> of{' '}
                {permissions.length} permissions assigned
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={loading}
                  className="text-xs h-7"
                >
                  <CheckSquare className="mr-1 h-3.5 w-3.5" />
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={loading}
                  className="text-xs h-7 text-muted-foreground"
                >
                  <Square className="mr-1 h-3.5 w-3.5" />
                  Clear All
                </Button>
              </div>
            </div>

            <div className="relative p-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {/* Scrollable area with auto scroll */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-3">
            <div className="space-y-4 p-1">
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No permissions match your search query.
                </div>
              ) : (
                Object.entries(groupedPermissions).map(([category, perms]) => {
                  const groupCodes = perms.map((p) => p.code)
                  const isGroupAllSelected = groupCodes.every((c) =>
                    selectedPermissions.includes(c)
                  )

                  return (
                    <div key={category} className="border rounded-md p-3 space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-semibold text-xs bg-background">
                            {category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({perms.filter((p) => selectedPermissions.includes(p.code)).length} / {perms.length})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleGroupPermissions(perms)}
                          className="h-6 text-xs font-normal"
                        >
                          {isGroupAllSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {perms.map((p) => {
                          const checked = selectedPermissions.includes(p.code)
                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => togglePermission(p.code)}
                              className={`flex items-start gap-2.5 p-2 rounded border text-left transition-colors ${
                                checked
                                  ? 'bg-primary/5 border-primary/40'
                                  : 'bg-background hover:bg-muted/50 border-border/50'
                              }`}
                            >
                              <div
                                className={`h-4 w-4 shrink-0 rounded border mt-0.5 flex items-center justify-center transition-colors ${
                                  checked
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-input bg-background'
                                }`}
                              >
                                {checked && <Check className="h-3 w-3" />}
                              </div>
                              <div className="space-y-0.5 overflow-hidden">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {p.name}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground truncate">
                                  {p.code}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Permissions'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
