import { ApiResponse } from "./api.type";

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string | null;
  business_name: string;
  provider: string;
  provider_id: string | null;
  avatar_url: string | null;
  balance: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type UserListResponse = ApiResponse<User[]>;
