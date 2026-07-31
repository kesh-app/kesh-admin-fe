'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Role, Permission } from '@/types/role-permission.type'
import { RoleTable } from './role-table'
import { PermissionList } from './permission-list'
import { RoleFormDialog } from './role-form-dialog'
import { AssignPermissionsDialog } from './assign-permissions-dialog'
import { Shield, Key, Plus, Search, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RolePermissionsClientProps {
  initialRoles: Role[]
  initialPermissions: Permission[]
}

export function RolePermissionsClient({
  initialRoles,
  initialPermissions,
}: RolePermissionsClientProps) {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles')
  const [searchRole, setSearchRole] = useState('')

  // Dialog States
  const [roleFormOpen, setRoleFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assigningRole, setAssigningRole] = useState<Role | null>(null)

  const filteredRoles = useMemo(() => {
    const searchLower = searchRole.toLowerCase().trim()
    if (!searchLower) return initialRoles

    return initialRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(searchLower) ||
        r.code.toLowerCase().includes(searchLower) ||
        (r.description && r.description.toLowerCase().includes(searchLower))
    )
  }, [initialRoles, searchRole])

  // Stats calculation
  const totalRoles = initialRoles.length
  const systemRolesCount = useMemo(() => initialRoles.filter((r) => r.is_system).length, [initialRoles])
  const activeRolesCount = useMemo(() => initialRoles.filter((r) => r.is_active !== false).length, [initialRoles])
  const totalPermissionsCount = initialPermissions.length

  const handleCreateNewRole = useCallback(() => {
    setEditingRole(null)
    setRoleFormOpen(true)
  }, [])

  const handleEditRole = useCallback((role: Role) => {
    setEditingRole(role)
    setRoleFormOpen(true)
  }, [])

  const handleAssignPermissions = useCallback((role: Role) => {
    setAssigningRole(role)
    setAssignDialogOpen(true)
  }, [])

  const handleDataRefresh = useCallback(() => {
    router.refresh()
  }, [router])

  const handleRoleFormOpenChange = useCallback((open: boolean) => {
    setRoleFormOpen(open)
    if (!open) {
      setEditingRole(null)
    }
  }, [])

  const handleAssignDialogOpenChange = useCallback((open: boolean) => {
    setAssignDialogOpen(open)
    if (!open) {
      setAssigningRole(null)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role & Permission Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage user roles, access control levels, and system permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCreateNewRole} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Create New Role
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Roles</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalRoles}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Roles</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{activeRolesCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">System Roles</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{systemRolesCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Permissions</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{totalPermissionsCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Key className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Nav */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('roles')}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="h-4 w-4" />
          Roles ({totalRoles})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'permissions'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Key className="h-4 w-4" />
          Permissions Directory ({totalPermissionsCount})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'roles' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by role code, name..."
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <span className="text-xs text-muted-foreground self-end sm:self-center">
              Showing {filteredRoles.length} of {totalRoles} roles
            </span>
          </div>

          <RoleTable
            roles={filteredRoles}
            onEdit={handleEditRole}
            onAssignPermissions={handleAssignPermissions}
          />
        </div>
      ) : (
        <PermissionList permissions={initialPermissions} />
      )}

      {/* Dialog Modals */}
      <RoleFormDialog
        open={roleFormOpen}
        onOpenChange={handleRoleFormOpenChange}
        role={editingRole}
        permissions={initialPermissions}
        onSuccess={handleDataRefresh}
      />

      <AssignPermissionsDialog
        open={assignDialogOpen}
        onOpenChange={handleAssignDialogOpenChange}
        role={assigningRole}
        permissions={initialPermissions}
        onSuccess={handleDataRefresh}
      />
    </div>
  )
}
