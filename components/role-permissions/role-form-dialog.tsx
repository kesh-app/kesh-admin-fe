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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Role, Permission, CreateRolePayload, UpdateRolePayload } from '@/types/role-permission.type'
import { createRoleAction, updateRoleAction } from '@/app/dashboard/role-permissions/actions'
import { toast } from 'sonner'
import { Shield, CheckSquare, Square, Search, Check } from 'lucide-react'

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  permissions: Permission[]
  onSuccess: () => void
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  permissions,
  onSuccess,
}: RoleFormDialogProps) {
  const isEdit = !!role

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSystem, setIsSystem] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [permissionSearch, setPermissionSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (role) {
        setCode(role.code || '')
        setName(role.name || '')
        setDescription(role.description || '')
        setIsSystem(role.is_system || false)
        setSelectedPermissions(role.permissions || [])
      } else {
        setCode('')
        setName('')
        setDescription('')
        setIsSystem(false)
        setSelectedPermissions([])
      }
      setPermissionSearch('')
    }
  }, [open, role?.id])

  // Group permissions by category (first segment of permission code before dot)
  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {}
    const searchLower = permissionSearch.toLowerCase().trim()

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
  }, [permissions, permissionSearch])

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

  const selectAllPermissions = useCallback(() => {
    setSelectedPermissions(permissions.map((p) => p.code))
  }, [permissions])

  const clearAllPermissions = useCallback(() => {
    setSelectedPermissions([])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Role name is required')
      return
    }

    if (!isEdit && !code.trim()) {
      toast.error('Role code is required')
      return
    }

    setLoading(true)

    try {
      if (isEdit && role) {
        const payload: UpdateRolePayload = {
          name: name.trim(),
          description: description.trim(),
          permission_codes: selectedPermissions,
        }

        const res = await updateRoleAction(role.id, payload)
        if (res.success) {
          toast.success(res.message || 'Role updated successfully')
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(res.message)
        }
      } else {
        const payload: CreateRolePayload = {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
          is_system: isSystem,
          permission_codes: selectedPermissions,
        }

        const res = await createRoleAction(payload)
        if (res.success) {
          toast.success(res.message || 'Role created successfully')
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(res.message)
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            {isEdit ? `Edit Role: ${role?.name}` : 'Create New Role'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update details and permission assignments for this role.'
              : 'Add a new access role and configure its specific permissions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable container with auto-scroll and inner padding for active focus rings */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
            <div className="space-y-5 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Role Code <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. TREASURY_MANAGER"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isEdit || loading}
                    className="font-mono uppercase"
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier code for API & backend logic.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Role Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Treasury Manager"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Display name shown in UI.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  placeholder="Describe what features or functions this role can perform..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={2}
                />
              </div>

              {!isEdit && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">System Role</label>
                    <p className="text-xs text-muted-foreground">
                      Mark whether this is a core system role.
                    </p>
                  </div>
                  <Switch
                    checked={isSystem}
                    onCheckedChange={setIsSystem}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Permissions Selection */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Assign Permissions ({selectedPermissions.length} selected)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select which permissions belong to this role.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllPermissions}
                      disabled={loading}
                      className="text-xs h-8"
                    >
                      <CheckSquare className="mr-1 h-3.5 w-3.5" />
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllPermissions}
                      disabled={loading}
                      className="text-xs h-8 text-muted-foreground"
                    >
                      <Square className="mr-1 h-3.5 w-3.5" />
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                <div className="space-y-4 border rounded-lg p-3 bg-background">
                  {Object.keys(groupedPermissions).length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No permissions match your filter.
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
                              <Badge variant="secondary" className="font-semibold text-xs">
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
                              className="h-7 text-xs font-normal"
                            >
                              {isGroupAllSelected ? 'Deselect Group' : 'Select Group'}
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {perms.map((p) => {
                              const checked = selectedPermissions.includes(p.code)
                              return (
                                <button
                                  type="button"
                                  key={p.id}
                                  onClick={() => togglePermission(p.code)}
                                  className={`flex items-start gap-2.5 p-2 rounded-md border text-left transition-colors ${
                                    checked
                                      ? 'bg-primary/5 border-primary/40'
                                      : 'bg-background hover:bg-muted/50 border-transparent'
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
                                  <div className="space-y-0.5 leading-none overflow-hidden">
                                    <p className="text-xs font-medium text-foreground truncate">
                                      {p.name}
                                    </p>
                                    <p className="text-[11px] font-mono text-muted-foreground truncate">
                                      {p.code}
                                    </p>
                                    {p.description && (
                                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                                        {p.description}
                                      </p>
                                    )}
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
            <Button type="submit" disabled={loading}>
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
