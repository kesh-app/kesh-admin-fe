'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'

export interface CreateIntrabankTransferPayload {
  acquirer_name: string
  sourceAccountNo: string
  amount: string
  beneficiaryAccountNo: string
}

export async function createIntrabankTransfer(payload: CreateIntrabankTransferPayload) {
  try {
    const response = await apiServer.post('/v1/disbursements/intrabank-transfer', payload)
    revalidatePath('/dashboard/history-disburse-intrabank')
    return {
      success: true,
      message: response.data?.message || 'Transaksi intrabank berhasil dibuat',
      data: response.data,
    }
  } catch (error: any) {
    console.error('Failed to create intrabank transfer:', error)
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'Gagal membuat transaksi intrabank transfer',
    }
  }
}
