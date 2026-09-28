'use server'

import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'
import {
  CreateMerchantProductRequest,
  UpdateMerchantProductRequest,
  MerchantProductListResponse,
  MerchantProductDetailResponse,
  ProductType,
  GroupStatusType,
  CreateMerchantProductGroupRequest,
  UpdateMerchantProductGroupRequest,
  MerchantProductGroupListResponse,
  MerchantProductGroupDetailResponse,
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

// ---- Merchant Product Groups ----

export interface GetMerchantProductGroupsParams {
  page?: number
  limit?: number
  search?: string
  status?: GroupStatusType
  type?: ProductType
}

export async function getMerchantProductGroups({
  page = 1,
  limit = 10,
  search,
  status = 'all',
  type,
}: GetMerchantProductGroupsParams = {}) {
  try {
    const params: Record<string, any> = { page, limit }
    if (status && status !== 'all') {
      params.status = status
    } else {
      params.status = 'all'
    }
    if (search && search.trim()) params.search = search.trim()
    if (type && type.trim()) params.type = type.trim()

    const response = await apiServer.get<MerchantProductGroupListResponse>('/v1/merchant-product-groups', {
      params,
    })
    return {
      success: true,
      data: response.data.data || [],
      meta: response.data.meta || null,
    }
  } catch (error: any) {
    console.error('Failed to get merchant product groups:', error)
    return {
      success: false,
      message: error.message || 'Failed to get merchant product groups',
      data: [],
      meta: null,
    }
  }
}

export async function createMerchantProductGroup(data: CreateMerchantProductGroupRequest) {
  try {
    const response = await apiServer.post<MerchantProductGroupDetailResponse>(
      '/v1/merchant-product-groups',
      data
    )
    revalidatePath('/dashboard/merchant-products')
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to create merchant product group:', error)
    return {
      success: false,
      message: error.message || 'Failed to create merchant product group',
    }
  }
}

export async function updateMerchantProductGroup(id: string, data: UpdateMerchantProductGroupRequest) {
  try {
    const response = await apiServer.patch<MerchantProductGroupDetailResponse>(
      `/v1/merchant-product-groups/${id}`,
      data
    )
    revalidatePath('/dashboard/merchant-products')
    return { success: true, data: response.data.data }
  } catch (error: any) {
    console.error('Failed to update merchant product group:', error)
    return {
      success: false,
      message: error.message || 'Failed to update merchant product group',
    }
  }
}

export async function deleteMerchantProductGroup(id: string) {
  try {
    await apiServer.delete(`/v1/merchant-product-groups/${id}`)
    revalidatePath('/dashboard/merchant-products')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete merchant product group:', error)
    return {
      success: false,
      message: error.message || 'Failed to delete merchant product group',
    }
  }
}
