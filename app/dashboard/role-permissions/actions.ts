'use server'

import { apiServer } from '@/libs/api-server.lib'
import { ApiResponse } from '@/types/api.type'
import {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
  AssignPermissionsPayload,
} from '@/types/role-permission.type'
import { revalidatePath } from 'next/cache'

export interface ActionResult<T = any> {
  success: boolean
  message: string
  data?: T
}

export async function fetchPermissions(): Promise<ActionResult<Permission[]>> {
  try {
    const response = await apiServer.get<ApiResponse<Permission[]>>('/v1/role-permissions/permissions')
    return {
      success: true,
      message: response.data.message || 'Permissions fetched successfully',
      data: response.data.data || [],
    }
  } catch (error: any) {
    console.error('Failed to fetch permissions:', error)
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch permissions',
      data: [],
    }
  }
}

export async function fetchRoles(): Promise<ActionResult<Role[]>> {
  try {
    const response = await apiServer.get<ApiResponse<Role[]>>('/v1/role-permissions/roles')
    return {
      success: true,
      message: response.data.message || 'Roles fetched successfully',
      data: response.data.data || [],
    }
  } catch (error: any) {
    console.error('Failed to fetch roles:', error)
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch roles',
      data: [],
    }
  }
}

export async function createRoleAction(payload: CreateRolePayload): Promise<ActionResult<Role>> {
  try {
    const response = await apiServer.post<ApiResponse<Role>>('/v1/role-permissions/roles', payload)
    revalidatePath('/dashboard/role-permissions')
    return {
      success: true,
      message: response.data.message || 'Role created successfully',
      data: response.data.data,
    }
  } catch (error: any) {
    console.error('Failed to create role:', error)
    const errorMsg = Array.isArray(error.response?.data?.message)
      ? error.response.data.message.join(', ')
      : error.response?.data?.message || error.message || 'Failed to create role'
    return {
      success: false,
      message: errorMsg,
    }
  }
}

export async function updateRoleAction(id: string, payload: UpdateRolePayload): Promise<ActionResult<Role>> {
  try {
    const response = await apiServer.patch<ApiResponse<Role>>(`/v1/role-permissions/roles/${id}`, payload)
    revalidatePath('/dashboard/role-permissions')
    return {
      success: true,
      message: response.data.message || 'Role updated successfully',
      data: response.data.data,
    }
  } catch (error: any) {
    console.error('Failed to update role:', error)
    const errorMsg = Array.isArray(error.response?.data?.message)
      ? error.response.data.message.join(', ')
      : error.response?.data?.message || error.message || 'Failed to update role'
    return {
      success: false,
      message: errorMsg,
    }
  }
}

export async function assignRolePermissionsAction(
  id: string,
  payload: AssignPermissionsPayload
): Promise<ActionResult<Role>> {
  try {
    const response = await apiServer.put<ApiResponse<Role>>(`/v1/role-permissions/roles/${id}/permissions`, payload)
    revalidatePath('/dashboard/role-permissions')
    return {
      success: true,
      message: response.data.message || 'Permissions assigned successfully',
      data: response.data.data,
    }
  } catch (error: any) {
    console.error('Failed to assign permissions:', error)
    const errorMsg = Array.isArray(error.response?.data?.message)
      ? error.response.data.message.join(', ')
      : error.response?.data?.message || error.message || 'Failed to assign permissions'
    return {
      success: false,
      message: errorMsg,
    }
  }
}
