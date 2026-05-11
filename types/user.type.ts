import { ApiResponse } from "./api.type";
import { SubMerchant } from "./sub-merchant.type";

export type { SubMerchant };

export interface Acquirer {
  id: string;
  name: string;
  is_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface KYB {
  id: string;
  company_name: string;
  store_name: string;
  account_number: string;
  company_tax_id: string;
  company_address: string;
  pic_name: string;
  pic_phone_number: string;
  pic_email: string;
  owner_full_name: string;
  owner_id_number: string;
  owner_phone_number: string;
  owner_email: string;
  business_name: string;
  business_type: string;
  business_category: string;
  business_address: string;
  id_card_document: string;
  additional_document: string;
  status: string;
  reason: string | null;
  updated_by_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
}

export interface ProjectSecret {
  id: string;
  project_name: string;
  callback_url: string;
  api_key: string;
  api_secret: string;
  is_status: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  acquirer_id: string;
  disburse_acquirer_rtol_id: string;
  disburse_acquirer_bifast_id: string;
  disburse_acquirer_intrabank_id: string;
  acquirer: Acquirer;
}


export interface User {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  business_name: string | null;
  provider: string;
  provider_id: string | null;
  avatar_url: string | null;
  balance: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  kyb?: KYB | null;
  project_secret?: ProjectSecret | null;
  sub_merchants?: SubMerchant[];
}

export type UserListResponse = ApiResponse<User[]>;
export type UserDetailResponse = ApiResponse<User>;
