'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'

export async function updateSubMerchantStatus(id: string, is_status: boolean) {
  try {
    await apiServer.patch(`/v1/sub-merchants/${id}/status`, { is_status })
    revalidatePath('/dashboard/submerchants')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update sub-merchant status:', error)
    return { success: false, message: error.message || 'Failed to update status' }
  }
}

export async function updateSubMerchant(id: string, data: any) {
  try {
    await apiServer.patch(`/v1/sub-merchants/${id}`, data)
    revalidatePath('/dashboard/submerchants')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update sub-merchant:', error)
    return { success: false, message: error.message || 'Failed to update sub-merchant' }
  }
}
