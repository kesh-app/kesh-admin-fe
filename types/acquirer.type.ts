import { ApiResponse } from "./api.type";

export interface Acquirer {
  id: string;
  name: string;
  is_status: boolean;
  created_at: string;
  updated_at: string;
  total_sub_merchants: number;
}

export type AcquirerListResponse = ApiResponse<Acquirer[]>;
