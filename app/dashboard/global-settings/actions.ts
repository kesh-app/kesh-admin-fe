'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import {
  CreateGlobalSettingRequest,
  UpdateGlobalSettingRequest,
  GlobalSettingDetailResponse,
} from '@/types/global-setting.type'

export async function createGlobalSetting(data: CreateGlobalSettingRequest) {
  try {
    await apiServer.post('/v1/global-settings', data)
    revalidatePath('/dashboard/global-settings')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create global setting:', error)
    return { success: false, message: error.message || 'Failed to create global setting' }
  }
}

export async function updateGlobalSetting(id: string, data: UpdateGlobalSettingRequest) {
  try {
    await apiServer.patch(`/v1/global-settings/${id}`, data)
    revalidatePath('/dashboard/global-settings')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update global setting:', error)
    return { success: false, message: error.message || 'Failed to update global setting' }
  }
}

export async function deleteGlobalSetting(id: string) {
  try {
    await apiServer.delete(`/v1/global-settings/${id}`)
    revalidatePath('/dashboard/global-settings')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete global setting:', error)
    return { success: false, message: error.message || 'Failed to delete global setting' }
  }
}

export async function getGlobalSettingById(id: string) {
  try {
    const response = await apiServer.get<GlobalSettingDetailResponse>(`/v1/global-settings/${id}`)
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to get global setting detail:', error)
    return { success: false, message: error.message || 'Failed to get global setting detail' }
  }
}
