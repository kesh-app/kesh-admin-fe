import { ApiResponse } from './api.type'

export const SMART_VA_GENERAL_CODES = [
  'DANA',
  'GOPAY',
  'OVO',
  'SHOPEEPAY',
  'LINKAJA',
] as const

export const SMART_VA_PROVIDERS = ['ICARE', 'LOKETBAYAR', 'NOBU'] as const

export type SmartVaGeneralCode = (typeof SMART_VA_GENERAL_CODES)[number]
export type SmartVaProvider = (typeof SMART_VA_PROVIDERS)[number]

export interface VaProduct {
  id: string
  product_name: string
  code: string
  provider: SmartVaProvider
  general_code: SmartVaGeneralCode | null
  routing_priority: number
  is_routing_active: boolean
  denomination_amount: string | number | null
  min_amount: string | number | null
  max_amount: string | number | null
  is_closed_amount: boolean
  fee_amount: string | number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateVaProductRequest {
  product_name: string
  code: string
  provider: SmartVaProvider
  general_code?: SmartVaGeneralCode
  routing_priority?: number
  is_routing_active?: boolean
  denomination_amount?: number
  min_amount?: number
  max_amount?: number
  is_closed_amount: boolean
  fee_amount: number
}

export type UpdateVaProductRequest = Partial<CreateVaProductRequest>

export interface SwitchVaProductProviderRequest {
  provider: SmartVaProvider
}

export interface VaProductRouteGroup {
  generalCode: SmartVaGeneralCode
  routes: VaProduct[]
  error?: string
}

export type VaProductListResponse = ApiResponse<VaProduct[]>
export type VaProductDetailResponse = ApiResponse<VaProduct>
export type VaProductRoutesResponse = ApiResponse<VaProduct[]>
