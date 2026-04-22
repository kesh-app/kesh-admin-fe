export enum QrisPaymentStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
}

export interface QrisTransaction {
  id: string;
  provider: string;
  partnerReferenceNo: string;
  providerReferenceNo: string | null;
  aggReferenceNo: string | null;
  retrievalReferenceNo: string | null;
  merchantId: string;
  merchantName: string;
  subMerchantId: string | null;
  subMerchantName: string | null;
  storeId: string;
  paymentChannel: string;
  currency: string;
  amountValue: string;
  qrContent: string;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
  lastStatusAt: string;
  latestTransactionStatus: string;
  paymentStatus: QrisPaymentStatus;
  metadata: any | null;
}

export interface QrisTransactionEvent {
  id: string;
  qrisTransactionId: string;
  provider: string;
  source: string;
  subMerchantId: string | null;
  transactionStatus: string;
  paidTime: string | null;
  payloadRaw: any;
  receivedAt: string;
}

export interface QrisListResponse {
  success: boolean;
  message: string;
  data: QrisTransaction[];
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

export interface QrisDetailResponse {
  success: boolean;
  message: string;
  data: QrisTransaction & {
    events: QrisTransactionEvent[];
  };
  timestamp: string;
  path: string;
}
