import { ApiResponse } from "./api.type";

export interface DisburseAcquirer {
  id: string;
  name: string;
  type: string;
  is_status: boolean;
  merchant_id: string;
  client_id: string;
  secret_id: string;
  partner_id: string;
  private_key: string;
  endpoint: string;
  source_account_no: string;
  source_bank_code: string;
  fee_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDisburseAcquirerRequest {
  name: string;
  type: string;
  is_status: boolean;
  merchant_id: string;
  client_id: string;
  secret_id: string;
  partner_id: string;
  private_key: string;
  endpoint: string;
  source_account_no: string;
  source_bank_code: string;
  fee_amount: number;
}

export type UpdateDisburseAcquirerRequest = Partial<CreateDisburseAcquirerRequest>;

export type DisburseAcquirerListResponse = ApiResponse<DisburseAcquirer[]>;
export type DisburseAcquirerDetailResponse = ApiResponse<DisburseAcquirer>;
