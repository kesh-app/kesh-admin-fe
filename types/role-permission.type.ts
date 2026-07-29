export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  owner_user_id: string | null;
  code: string;
  name: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateRolePayload {
  code: string;
  name: string;
  description: string;
  is_system?: boolean;
  permission_codes: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permission_codes: string[];
}

export interface AssignPermissionsPayload {
  permission_codes: string[];
}
