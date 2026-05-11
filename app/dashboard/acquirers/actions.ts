'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import { CreateAcquirerRequest, UpdateAcquirerRequest } from '@/types/acquirer.type'

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
