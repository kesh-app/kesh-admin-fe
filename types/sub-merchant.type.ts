import { ApiResponse } from "./api.type";

export interface SubMerchant {
  id: string;
  sub_merchant_id: string;
  sub_merchant_name: string;
  is_status: boolean;
  store_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  acquirer_id: string;
  user: {
    id: string;
    name: string | null;
  };
  acquirer: {
    id: string;
    name: string;
  };
}

export type SubMerchantListResponse = ApiResponse<SubMerchant[]>;
export type SubMerchantDetailResponse = ApiResponse<SubMerchant>;
