import { ApiResponse } from "./api.type";

export interface Acquirer {
  id: string;
  name: string;
  merchant_id: string;
  client_id: string;
  secret_id: string;
  partner_id: string;
  private_key: string;
  endpoint: string;
  is_status: boolean;
  created_at: string;
  updated_at: string;
  total_sub_merchants: number;
}

export interface CreateAcquirerRequest {
  name: string;
  merchant_id: string;
  client_id: string;
  secret_id: string;
  partner_id: string;
  private_key: string;
  endpoint: string;
}

export interface UpdateAcquirerRequest extends CreateAcquirerRequest {
  is_status: boolean;
}

export type AcquirerListResponse = ApiResponse<Acquirer[]>;
