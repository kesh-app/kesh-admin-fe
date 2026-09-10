import { ApiResponse } from "./api.type";

export type ProductType = 'VA' | 'USER';

export interface MerchantProduct {
  id: string;
  type?: ProductType;
  product_name: string;
  code: string;
  provider: string;
  is_closed_amount: boolean;
  fee_amount: string | number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateMerchantProductRequest {
  type: ProductType;
  product_name: string;
  code: string;
  provider: string;
  is_closed_amount: boolean;
  fee_amount: number;
}

export type UpdateMerchantProductRequest = Partial<CreateMerchantProductRequest>;

export type MerchantProductListResponse = ApiResponse<MerchantProduct[]>;
export type MerchantProductDetailResponse = ApiResponse<MerchantProduct>;

// Aliases for compatibility
export type VaProduct = MerchantProduct;
export type CreateVaProductRequest = CreateMerchantProductRequest;
export type UpdateVaProductRequest = UpdateMerchantProductRequest;
export type VaProductListResponse = MerchantProductListResponse;
export type VaProductDetailResponse = MerchantProductDetailResponse;
