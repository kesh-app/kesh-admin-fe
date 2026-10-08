import { ApiResponse } from "./api.type";

export type GlobalSettingType = "SWAGGER" | string;

export interface SwaggerAdditionalData {
  username: string;
  password: string;
}

export interface GlobalSetting {
  id: string;
  type: GlobalSettingType;
  name: string;
  value: string | null;
  additional_data: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateGlobalSettingRequest {
  type: GlobalSettingType;
  name: string;
  value?: string;
  additional_data?: Record<string, string>;
}

export interface UpdateGlobalSettingRequest extends CreateGlobalSettingRequest {}

export type GlobalSettingListResponse = ApiResponse<GlobalSetting[]>;
export type GlobalSettingDetailResponse = ApiResponse<GlobalSetting>;
