import { ApiResponse } from "./api.type";

export interface VaProduct {
  id: string;
  product_name: string;
  code: string;
  provider: string;
  is_closed_amount: boolean;
  fee_amount: string | number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateVaProductRequest {
  product_name: string;
  code: string;
  provider: string;
  is_closed_amount: boolean;
  fee_amount: number;
}

export type UpdateVaProductRequest = Partial<CreateVaProductRequest>;

export type VaProductListResponse = ApiResponse<VaProduct[]>;
export type VaProductDetailResponse = ApiResponse<VaProduct>;
