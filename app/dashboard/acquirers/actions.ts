'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import { CreateAcquirerRequest, UpdateAcquirerRequest, AcquirerDetailResponse } from '@/types/acquirer.type'

export async function getAcquirerById(id: string) {
  try {
    const response = await apiServer.get<AcquirerDetailResponse>(`/v1/acquirers/${id}`)
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to get acquirer detail:', error)
    return { success: false, message: error.message || 'Failed to get acquirer detail' }
  }
}

export async function updateAcquirerStatus(id: string, is_status: boolean) {
  try {
    await apiServer.patch(`/v1/acquirers/${id}/status`, { is_status })
    revalidatePath('/dashboard/acquirers')
    revalidatePath(`/dashboard/acquirers/${id}`)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update acquirer status:', error)
    return { success: false, message: error.message || 'Failed to update status' }
  }
}

export async function createAcquirer(data: CreateAcquirerRequest) {
  try {
    await apiServer.post('/v1/acquirers', data)
    revalidatePath('/dashboard/acquirers')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create acquirer:', error)
    return { success: false, message: error.message || 'Failed to create acquirer' }
  }
}

export async function updateAcquirer(id: string, data: UpdateAcquirerRequest) {
  try {
    await apiServer.put(`/v1/acquirers/${id}`, data)
    revalidatePath('/dashboard/acquirers')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update acquirer:', error)
    return { success: false, message: error.message || 'Failed to update acquirer' }
  }
}
