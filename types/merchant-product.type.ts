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
  group_id?: string | null;
  priority?: number;
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

// ---- Merchant Product Groups ----

export type GroupStatusType = 'all' | 'active' | 'inactive';

export interface MerchantProductGroupProductItem {
  id: string;
  product_name: string;
  code: string;
  provider: string;
  type: ProductType;
  is_closed_amount: boolean;
  fee_amount: string | number;
  group_id?: string;
  priority: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface MerchantProductGroupProduct {
  product_id: string;
  priority: number;
}

export interface MerchantProductGroup {
  id: string;
  name: string;
  type: ProductType;
  is_active: boolean;
  inactive_at?: string | null;
  product_ids?: string[];
  products?: (MerchantProductGroupProductItem | MerchantProductGroupProduct)[];
  products_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateMerchantProductGroupRequest {
  name: string;
  type: ProductType;
  is_active: boolean;
  product_ids: string[];
  products: MerchantProductGroupProduct[];
}

export type UpdateMerchantProductGroupRequest = CreateMerchantProductGroupRequest;

export type MerchantProductGroupListResponse = ApiResponse<MerchantProductGroup[]>;
export type MerchantProductGroupDetailResponse = ApiResponse<MerchantProductGroup>;
