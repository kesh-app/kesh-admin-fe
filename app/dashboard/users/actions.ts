'use server'

import { apiServer } from '@/libs/api-server.lib'
import { DailyReport } from '@/types/user.type'
import { ApiResponse, PaginationMeta } from '@/types/api.type'

export interface FetchDailyReportsResult {
  success: boolean
  data: DailyReport[]
  meta: PaginationMeta | null
  message?: string
}

export interface FetchDownloadUrlResult {
  success: boolean
  url?: string
  message?: string
}

export async function fetchUserDailyReports(
  userId: string,
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 10
): Promise<FetchDailyReportsResult> {
  try {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
      page: page.toString(),
      start_date: startDate,
      end_date: endDate,
    })

    const response = await apiServer.get<ApiResponse<DailyReport[]>>(
      `/v1/report/qris?${params.toString()}`
    )

    return {
      success: true,
      data: response.data.data || [],
      meta: response.data.meta || null,
    }
  } catch (error: any) {
    console.error('Failed to fetch daily reports:', error)
    return {
      success: false,
      data: [],
      meta: null,
      message: error.message || 'Failed to fetch daily reports',
    }
  }
}

export async function fetchDownloadUrl(
  downloadJobId: string
): Promise<FetchDownloadUrlResult> {
  try {
    const response = await apiServer.get<ApiResponse<{ url: string }>>(
      `/v1/utils/downloads/${downloadJobId}/url`
    )

    const url = response.data.data?.url
    if (!url) {
      return { success: false, message: 'Download URL not available' }
    }

    return { success: true, url }
  } catch (error: any) {
    console.error('Failed to fetch download URL:', error)
    return {
      success: false,
      message: error.message || 'Failed to get download URL',
    }
  }
}

import { DisburseReport } from '@/types/user.type'

export interface FetchDisburseReportsResult {
  success: boolean
  data: DisburseReport[]
  meta: PaginationMeta | null
  message?: string
}

export async function fetchUserDisburseReports(
  userId: string,
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 10
): Promise<FetchDisburseReportsResult> {
  try {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
      page: page.toString(),
      start_date: startDate,
      end_date: endDate,
    })

    const response = await apiServer.get<ApiResponse<DisburseReport[]>>(
      `/v1/report/disburse?${params.toString()}`
    )

    return {
      success: true,
      data: response.data.data || [],
      meta: response.data.meta || null,
    }
  } catch (error: any) {
    console.error('Failed to fetch disburse reports:', error)
    return {
      success: false,
      data: [],
      meta: null,
      message: error.message || 'Failed to fetch disburse reports',
    }
  }
}

import { UpdateBalancePayload, UpdateVABalancePayload, BalanceHistory } from '@/types/user.type'

export async function updateUserBalance(userId: string, payload: UpdateBalancePayload) {
  try {
    const response = await apiServer.patch(`/v1/balance/users/${userId}`, payload)
    return { success: true, message: response.data.message || 'Balance updated successfully' }
  } catch (error: any) {
    console.error('Failed to update balance:', error)
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update balance',
    }
  }
}

export interface FetchBalanceHistoryResult {
  success: boolean
  data: BalanceHistory[]
  meta: PaginationMeta | null
  message?: string
}

export async function fetchUserBalanceHistories(
  userId: string,
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 10
): Promise<FetchBalanceHistoryResult> {
  if (!startDate || !endDate) {
    return { success: true, data: [], meta: null }
  }

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      start_date: startDate,
      end_date: endDate,
    })

    const response = await apiServer.get<ApiResponse<BalanceHistory[]>>(
      `/v1/balance/users/${userId}/histories?${params.toString()}`
    )

    return {
      success: true,
      data: response.data.data || [],
      meta: response.data.meta || null,
    }
  } catch (error: any) {
    console.error('Failed to fetch balance histories:', error)
    return {
      success: false,
      data: [],
      meta: null,
      message: error.response?.data?.message || error.message || 'Failed to fetch balance histories',
    }
  }
}

export async function updateUserVABalance(userId: string, payload: UpdateVABalancePayload) {
  try {
    const response = await apiServer.patch(`/v1/va-balances/user/${userId}`, payload)
    return { success: true, message: response.data.message || 'VA Balance updated successfully' }
  } catch (error: any) {
    console.error('Failed to update VA balance:', error)
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update VA balance',
    }
  }
}

export async function fetchUserVABalanceHistories(
  userId: string,
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 10
): Promise<FetchBalanceHistoryResult> {
  if (!startDate || !endDate) {
    return { success: true, data: [], meta: null }
  }

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      start_date: startDate,
      end_date: endDate,
    })

    const response = await apiServer.get<ApiResponse<BalanceHistory[]>>(
      `/v1/va-balances/user/${userId}/histories?${params.toString()}`
    )

    return {
      success: true,
      data: response.data.data || [],
      meta: response.data.meta || null,
    }
  } catch (error: any) {
    console.error('Failed to fetch VA balance histories:', error)
    return {
      success: false,
      data: [],
      meta: null,
      message: error.response?.data?.message || error.message || 'Failed to fetch VA balance histories',
    }
  }
}
