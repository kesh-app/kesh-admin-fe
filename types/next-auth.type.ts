import { UserData } from "./auth.type";

declare module "next-auth" {
  interface Session {
    user: UserData;
    accessToken?: string;
    refreshToken?: string;
    error?: "RefreshAccessTokenError";
  }

  interface User extends UserData {}
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: UserData;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
  }
}
