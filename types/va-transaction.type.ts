export interface VATransactionEvent {
  id: string;
  va_transaction_id: string;
  provider: string;
  source: string;
  transaction_status: string;
  paid_time: string | null;
  payload_raw: any;
  created_at: string;
}

export interface VATransaction {
  id: string;
  user_id: string;
  provider: string;
  partner_service_id: string;
  customer_no: string;
  virtual_account_no: string;
  virtual_account_name: string;
  payment_request_id: string;
  total_amount: string;
  fee_amount: string;
  currency: string;
  direction: string;
  status: string;
  sub_type: string;
  created_at: string;
  updated_at: string;
  events?: VATransactionEvent[];
}

export interface VAListResponse {
  success: boolean;
  message: string;
  data: VATransaction[];
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

export interface VADetailResponse {
  success: boolean;
  message: string;
  data: VATransaction;
  timestamp: string;
  path: string;
}
