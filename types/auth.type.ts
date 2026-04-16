export interface UserData {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  access_token?: string;
  refresh_token?: string;
}
