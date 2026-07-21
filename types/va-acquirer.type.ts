import { ApiResponse } from "./api.type";

export interface VaAcquirer {
  id: string;
  name: string;
  provider: string;
  service_type: string;
  is_status: boolean;
  client_id?: string;
  secret_id?: string;
  partner_id?: string;
  merchant_id?: string | null;
  private_key?: string;
  public_key?: string | null;
  endpoint: string;
  partner_service_id: string;
  source_account_no?: string | null;
  source_bank_code?: string | null;
  additional_config?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateVaAcquirerRequest {
  name: string;
  provider: string;
  service_type: string;
  is_status: boolean;
  client_id: string;
  secret_id: string;
  partner_id: string;
  merchant_id: string;
  private_key: string;
  public_key?: string;
  endpoint: string;
  partner_service_id: string;
  source_account_no: string;
  source_bank_code: string;
  additional_config?: any;
}

export type UpdateVaAcquirerRequest = Partial<CreateVaAcquirerRequest>;

export type VaAcquirerListResponse = ApiResponse<VaAcquirer[]>;
export type VaAcquirerDetailResponse = ApiResponse<VaAcquirer>;
