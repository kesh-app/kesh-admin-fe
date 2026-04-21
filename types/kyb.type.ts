export interface KYBUser {
  id: string;
  email: string;
  phone: string;
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
}

export interface KYBData {
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
  additional_document: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  updated_by_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  user: KYBUser;
  updatedBy?: any;
}

export interface KYBListResponse {
  success: boolean;
  message: string;
  data: KYBData[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
  path: string;
}

export interface KYBDetailResponse {
  success: boolean;
  message: string;
  data: KYBData;
  timestamp: string;
  path: string;
}

export interface KYBStatusUpdateRequest {
  status: 'approved' | 'rejected' | 'pending';
  reason?: string;
}
