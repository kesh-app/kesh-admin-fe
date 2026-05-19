'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'

export async function updateSubMerchantStatus(id: string, is_status: boolean, path?: string) {
  try {
    await apiServer.patch(`/v1/sub-merchants/${id}/status`, { is_status })
    revalidatePath('/dashboard/submerchants')
    if (path) revalidatePath(path)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update sub-merchant status:', error)
    return { success: false, message: error.message || 'Failed to update status' }
  }
}

export async function updateSubMerchant(id: string, data: any, path?: string) {
  try {
    await apiServer.patch(`/v1/sub-merchants/${id}`, data)
    revalidatePath('/dashboard/submerchants')
    if (path) revalidatePath(path)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update sub-merchant:', error)
    return { success: false, message: error.message || 'Failed to update sub-merchant' }
  }
}

export async function bulkAssignSubMerchants(data: any[]) {
  try {
    await apiServer.post('/v1/sub-merchants/bulk-assign', { data })
    revalidatePath('/dashboard/submerchants')
    return { success: true }
  } catch (error: any) {
    console.error('Failed bulk sub-merchant assignment:', error)
    return { success: false, message: error.message || 'Failed bulk assignment' }
  }
}

export async function bulkAssignSubMerchantByUserId(userId: string, data: any[]) {
  try {
    await apiServer.post('/v1/sub-merchants/bulk-assign-user', { user_id: userId, data })
    revalidatePath('/dashboard/submerchants')
    revalidatePath(`/dashboard/users/${userId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Failed bulk sub-merchant assignment by user id:', error)
    return { success: false, message: error.message || 'Failed bulk assignment' }
  }
}
