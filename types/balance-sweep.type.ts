import { ApiResponse } from "./api.type";

export type BalanceSweepStatus = 'FAILED' | 'SUCCESS' | 'SKIPPED';

export interface BalanceSweepEvent {
  id: string;
  partnerReferenceNo: string | null;
  referenceNo: string | null;
  sourceAccountNo: string | null;
  sourceAccountName: string | null;
  beneficiaryAccountNo: string | null;
  beneficiaryAccountName: string | null;
  amountValue: string;
  currency: string;
  status: BalanceSweepStatus;
  responseCode: string | null;
  responseMessage: string | null;
  payloadRaw: any;
  createdAt: string;
  updatedAt: string;
}

export type BalanceSweepEventListResponse = ApiResponse<BalanceSweepEvent[]>;
