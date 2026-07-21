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
  bank_code: string | null;
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
  can_qris: boolean;
  can_disburse: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
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
}

export type UserListResponse = ApiResponse<User[]>;
export type UserDetailResponse = ApiResponse<User>;

export type UserSubMerchantsResponse = ApiResponse<SubMerchant[]>;

export interface QrisSummary {
  current_balance: string;
  total_revenue: string;
  total_transactions: number;
  success_count: number;
  success_rate: number;
}

export type QrisSummaryResponse = ApiResponse<QrisSummary>;

export interface DailyReport {
  id: string;
  user_id: string;
  download_job_id: string;
  report_date: string;
  business_name: string;
  total_tx: number;
  success_tx: number;
  pending_tx: number;
  failed_tx: number;
  total_gmv: string;
  success_gmv: string;
  created_at: string;
  updated_at: string;
}

export type DailyReportResponse = ApiResponse<DailyReport[]>;

export interface DisburseReport {
  id: string;
  reportDate: string;
  businessName: string;
  totalTx: number;
  successTx: number;
  pendingTx: number;
  failedTx: number;
  totalDebit: number;
  totalCredit: number;
  beginningBalance: number;
  endingBalance: number;
  downloadId: string;
  createdAt: string;
}

export type DisburseReportResponse = ApiResponse<DisburseReport[]>;

export interface BalanceHistory {
  id: string;
  description: string;
  debit: number;
  credit: number;
  beginningBalance: number;
  endingBalance: number;
  status: string;
  createdAt: string;
}

export type BalanceHistoryResponse = ApiResponse<BalanceHistory[]>;

export interface UpdateBalancePayload {
  fund_type: 'DEBIT' | 'CREDIT';
  amount: number;
  reason: string;
}
