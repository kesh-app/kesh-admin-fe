export type BalanceRequestTargetType = "VA" | "USER";
export type BalanceRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BalanceAdjustmentType = "CREDIT" | "DEBIT" | string;

export interface BalanceRequestUser {
  id: string;
  email: string;
  name: string;
  business_name?: string | null;
}

export interface BalanceRequestItem {
  id: string;
  request_number: string;
  target_type: BalanceRequestTargetType;
  user_id: string;
  amount: string;
  adjustment_type: BalanceAdjustmentType;
  status: BalanceRequestStatus;
  reason?: string | null;
  proof_download_job_id?: string | null;
  approved_by?: string | null;
  admin_notes?: string | null;
  processed_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: BalanceRequestUser | null;
}

export interface BalanceRequestListResponse {
  success: boolean;
  message: string;
  data: BalanceRequestItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp?: string;
  path?: string;
}

export interface ApproveRejectBalanceRequestPayload {
  admin_notes?: string;
}
