'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import { KYBStatusUpdateRequest } from '@/types/kyb.type'

export async function updateKYBStatus(id: string, formData: FormData) {
  const status = formData.get('status') as 'approved' | 'rejected' | 'pending';
  const reason = formData.get('reason') as string | undefined;

  try {
    const payload: KYBStatusUpdateRequest = {
      status,
    };
    
    if (status === 'rejected') {
      payload.reason = reason;
    }

    await apiServer.patch(`/v1/kyb/${id}/status`, payload)
    
    revalidatePath('/dashboard/kyb')
    revalidatePath(`/dashboard/kyb/${id}`)
    
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update KYB status:', error)
    return { 
      success: false, 
      message: error.message || 'Failed to update status' 
    }
  }
}
