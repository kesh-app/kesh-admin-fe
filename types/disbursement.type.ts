export interface DisbursementEvent {
  id: string;
  disbursementId: string;
  /** Provider status code: 00 = success, 03 = pending, 06 = failed. */
  transactionStatus: string | null;
  processedTime: string | null;
  payloadRaw: any;
  receivedAt: string;
  provider: string | null;
  subMerchantId: string | null;
}

export interface Disbursement {
  id: string;
  partnerRefNo: string;
  referenceNo: string;
  amountValue: string;
  currency: string;
  beneficiaryAccountNo: string;
  beneficiaryName: string | null;
  beneficiaryBankCode: string;
  sourceAccountNo: string;
  status: string;
  failureReason: string | null;
  subMerchantId: string | null;
  acquirerId: string;
  projectId: string | null;
  userId: string | null;
  createdAt: string;
  processedAt: string | null;
  updatedAt: string;
  /** Only present on the detail endpoint. */
  events?: DisbursementEvent[];
  method?: 'RTOL' | 'BIFAST' | 'INTRABANK' | null;
}

export interface DisbursementListResponse {
  success: boolean;
  message: string;
  data: Disbursement[];
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

export interface DisbursementDetailResponse {
  success: boolean;
  message: string;
  data: Disbursement;
  timestamp: string;
  path: string;
}

/** Outcome of the merchant callback attempted right after a manual finalisation. */
export interface CallbackDeliveryResult {
  outcome: 'DELIVERED' | 'FAILED';
  httpStatus: number | null;
  totalAttempts: number;
  failureCategory: string | null;
  errorMessage: string | null;
}
