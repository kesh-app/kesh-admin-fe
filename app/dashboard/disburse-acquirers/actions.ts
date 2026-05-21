'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import { CreateDisburseAcquirerRequest, UpdateDisburseAcquirerRequest, DisburseAcquirerDetailResponse } from '@/types/disburse-acquirer.type'

export async function getDisburseAcquirerById(id: string) {
  try {
    const response = await apiServer.get<DisburseAcquirerDetailResponse>(`/v1/disburse-acquirers/${id}`)
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to get disburse acquirer detail:', error)
    return { success: false, message: error.message || 'Failed to get disburse acquirer detail' }
  }
}

export async function createDisburseAcquirer(data: CreateDisburseAcquirerRequest) {
  try {
    await apiServer.post('/v1/disburse-acquirers', data)
    revalidatePath('/dashboard/disburse-acquirers')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create disburse acquirer:', error)
    return { success: false, message: error.message || 'Failed to create disburse acquirer' }
  }
}

export async function updateDisburseAcquirer(id: string, data: UpdateDisburseAcquirerRequest) {
  try {
    await apiServer.put(`/v1/disburse-acquirers/${id}`, data)
    revalidatePath('/dashboard/disburse-acquirers')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update disburse acquirer:', error)
    return { success: false, message: error.message || 'Failed to update disburse acquirer' }
  }
}
