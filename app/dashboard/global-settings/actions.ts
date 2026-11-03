'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import {
  CreateGlobalSettingRequest,
  UpdateGlobalSettingRequest,
  GlobalSettingDetailResponse,
  GlobalSettingListResponse,
} from '@/types/global-setting.type'

export async function getGlobalSettings(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  try {
    const response = await apiServer.get<GlobalSettingListResponse>('/v1/global-settings', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 30,
        ...(params?.search ? { search: params.search } : {}),
      },
    })
    return { success: true, data: response.data }
  } catch (error: any) {
    console.error('Failed to get global settings:', error)
    return { success: false, message: error.message || 'Failed to get global settings', data: null }
  }
}

export async function checkGlobalSettingTypeExists(type: string) {
  try {
    const trimmed = type.trim()
    if (!trimmed) {
      return { success: true, exists: false }
    }
    const response = await apiServer.get<GlobalSettingDetailResponse>(
      `/v1/global-settings/by-type/${encodeURIComponent(trimmed)}`
    )
    const exists = !!response.data?.data
    return { success: true, exists }
  } catch (error: any) {
    // 404 means type not found/not existing yet
    if (error?.status === 404 || error?.response?.status === 404) {
      return { success: true, exists: false }
    }
    return { success: false, message: error.message || 'Failed to check type', exists: false }
  }
}

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
    console.log("server ",response.data.data)
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to get global setting detail:', error)
    return { success: false, message: error.message || 'Failed to get global setting detail' }
  }
}
