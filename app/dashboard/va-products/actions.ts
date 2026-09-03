'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import {
  CreateVaProductRequest,
  UpdateVaProductRequest,
  VaProductListResponse,
  VaProductDetailResponse,
} from '@/types/va-product.type'

export interface GetVaProductsParams {
  page?: number
  limit?: number
  search?: string
  provider?: string
}

export async function getVaProducts({
  page = 1,
  limit = 10,
  search,
  provider,
}: GetVaProductsParams = {}) {
  try {
    const params: Record<string, any> = { page, limit }
    if (search && search.trim()) params.search = search.trim()
    if (provider && provider.trim()) params.provider = provider.trim()

    const response = await apiServer.get<VaProductListResponse>('/v1/va-products', {
      params,
    })
    return {
      success: true,
      data: response.data.data || [],
      meta: response.data.meta || null,
    }
  } catch (error: any) {
    console.error('Failed to get VA products:', error)
    return {
      success: false,
      message: error.message || 'Failed to get VA products',
      data: [],
      meta: null,
    }
  }
}

export async function createVaProduct(data: CreateVaProductRequest) {
  try {
    const response = await apiServer.post<VaProductDetailResponse>('/v1/va-products', data)
    revalidatePath('/dashboard/va-products')
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to create VA product:', error)
    return {
      success: false,
      message: error.message || 'Failed to create VA product',
    }
  }
}

export async function updateVaProduct(id: string, data: UpdateVaProductRequest) {
  try {
    const response = await apiServer.patch<VaProductDetailResponse>(`/v1/va-products/${id}`, data)
    revalidatePath('/dashboard/va-products')
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to update VA product:', error)
    return {
      success: false,
      message: error.message || 'Failed to update VA product',
    }
  }
}

export async function deleteVaProduct(id: string) {
  try {
    await apiServer.delete(`/v1/va-products/${id}`)
    revalidatePath('/dashboard/va-products')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete VA product:', error)
    return {
      success: false,
      message: error.message || 'Failed to delete VA product',
    }
  }
}
