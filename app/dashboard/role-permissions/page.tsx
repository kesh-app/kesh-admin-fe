import { apiServer } from '@/libs/api-server.lib'
import { ApiResponse } from '@/types/api.type'
import { Role, Permission } from '@/types/role-permission.type'
import { RolePermissionsClient } from '@/components/role-permissions/role-permissions-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export const revalidate = 0

export default async function RolePermissionsPage() {
  let roles: Role[] = []
  let permissions: Permission[] = []
  let errorMsg: string | null = null

  try {
    const [rolesRes, permsRes] = await Promise.all([
      apiServer.get<ApiResponse<Role[]>>('/v1/role-permissions/roles'),
      apiServer.get<ApiResponse<Permission[]>>('/v1/role-permissions/permissions'),
    ])

    roles = rolesRes.data.data || []
    permissions = permsRes.data.data || []
  } catch (err: any) {
    console.error('Failed to load role permissions page data:', err)
    errorMsg = err.message || 'Failed to load roles and permissions data from server.'
  }

  if (errorMsg) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role & Permission Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage user roles, access control levels, and system permissions.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return <RolePermissionsClient initialRoles={roles} initialPermissions={permissions} />
}
