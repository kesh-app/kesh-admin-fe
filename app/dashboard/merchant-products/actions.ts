'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import {
  CreateMerchantProductRequest,
  UpdateMerchantProductRequest,
  MerchantProductListResponse,
  MerchantProductDetailResponse,
  ProductType,
} from '@/types/merchant-product.type'

export interface GetMerchantProductsParams {
  page?: number
  limit?: number
  search?: string
  provider?: string
  type?: ProductType
}

export async function getMerchantProducts({
  page = 1,
  limit = 10,
  search,
  provider,
  type,
}: GetMerchantProductsParams = {}) {
  try {
    const params: Record<string, any> = { page, limit }
    if (search && search.trim()) params.search = search.trim()
    if (provider && provider.trim()) params.provider = provider.trim()
    if (type && type.trim()) params.type = type.trim()

    const response = await apiServer.get<MerchantProductListResponse>('/v1/merchant-products', {
      params,
    })
    return {
      success: true,
      data: response.data.data || [],
      meta: response.data.meta || null,
    }
  } catch (error: any) {
    console.error('Failed to get merchant products:', error)
    return {
      success: false,
      message: error.message || 'Failed to get merchant products',
      data: [],
      meta: null,
    }
  }
}

export async function createMerchantProduct(data: CreateMerchantProductRequest) {
  try {
    const response = await apiServer.post<MerchantProductDetailResponse>('/v1/merchant-products', data)
    revalidatePath('/dashboard/merchant-products')
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to create merchant product:', error)
    return {
      success: false,
      message: error.message || 'Failed to create merchant product',
    }
  }
}

export async function updateMerchantProduct(id: string, data: UpdateMerchantProductRequest) {
  try {
    const response = await apiServer.patch<MerchantProductDetailResponse>(`/v1/merchant-products/${id}`, data)
    revalidatePath('/dashboard/merchant-products')
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to update merchant product:', error)
    return {
      success: false,
      message: error.message || 'Failed to update merchant product',
    }
  }
}

export async function deleteMerchantProduct(id: string) {
  try {
    await apiServer.delete(`/v1/merchant-products/${id}`)
    revalidatePath('/dashboard/merchant-products')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete merchant product:', error)
    return {
      success: false,
      message: error.message || 'Failed to delete merchant product',
    }
  }
}

// Aliases for backward compatibility
export type GetVaProductsParams = GetMerchantProductsParams
export const getVaProducts = getMerchantProducts
export const createVaProduct = createMerchantProduct
export const updateVaProduct = updateMerchantProduct
export const deleteVaProduct = deleteMerchantProduct
