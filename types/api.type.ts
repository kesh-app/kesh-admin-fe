
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp?: string;
  path?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string | string[];
  error?: string;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  data?: any;
}