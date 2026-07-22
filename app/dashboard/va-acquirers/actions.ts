'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import { 
  CreateVaAcquirerRequest, 
  UpdateVaAcquirerRequest, 
  VaAcquirerListResponse, 
  VaAcquirerDetailResponse 
} from '@/types/va-acquirer.type'

export async function getVaAcquirers(page = 1, limit = 10) {
  try {
    const response = await apiServer.get<VaAcquirerListResponse>(`/v1/va-acquirers?page=${page}&limit=${limit}`)
    return { success: true, data: response.data.data, meta: response.data.meta }
  } catch (error: any) {
    console.error('Failed to get va acquirers:', error)
    return { success: false, message: error.message || 'Failed to get va acquirers', data: [], meta: null }
  }
}

export async function getVaAcquirerById(id: string) {
  try {
    const response = await apiServer.get<VaAcquirerDetailResponse>(`/v1/va-acquirers/${id}`)
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to get va acquirer detail:', error)
    return { success: false, message: error.message || 'Failed to get va acquirer detail' }
  }
}

export async function createVaAcquirer(data: CreateVaAcquirerRequest) {
  try {
    await apiServer.post('/v1/va-acquirers', data)
    revalidatePath('/dashboard/va-acquirers')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create va acquirer:', error)
    return { success: false, message: error.message || 'Failed to create va acquirer' }
  }
}

export async function updateVaAcquirer(id: string, data: UpdateVaAcquirerRequest) {
  try {
    await apiServer.put(`/v1/va-acquirers/${id}`, data)
    revalidatePath('/dashboard/va-acquirers')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update va acquirer:', error)
    return { success: false, message: error.message || 'Failed to update va acquirer' }
  }
}

export async function updateVaAcquirerStatus(id: string, is_status: boolean) {
  try {
    await apiServer.patch(`/v1/va-acquirers/${id}/status`, { is_status })
    revalidatePath('/dashboard/va-acquirers')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update va acquirer status:', error)
    return { success: false, message: error.message || 'Failed to update status' }
  }
}
