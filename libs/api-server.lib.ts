import { ApiErrorResponse } from "@/types/api.type";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getToken } from "next-auth/jwt";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

const isRedirectError = (error: unknown): error is { digest: string } => {
  return !!error && typeof error === 'object' && 'digest' in error && typeof (error as { digest: unknown }).digest === 'string' && (error as { digest: string }).digest.startsWith('NEXT_REDIRECT');
};

const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  const cookiesToClear = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "next-auth.callback-url",
    "next-auth.state",
    "next-auth.pkce.code_verifier",
  ];
  cookiesToClear.forEach(cookie => {
    try {
      cookieStore.delete(cookie);
    } catch (e) {
      // Ignore errors if cookie doesn't exist
    }
  });
};

export async function getBaseUrl() {
  return process.env.BASE_API_URL;
}

export async function refreshTokens(refreshToken: string) {
  const baseUrl = await getBaseUrl();
  const res = await axios.post(`${baseUrl}/v1/auth/refresh-token`, 
    { refresh_token: refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

let _apiServer: AxiosInstance | null = null;
let refreshPromise: Promise<string | null> | null = null;

const getApiServer = (): AxiosInstance => {
  if (_apiServer) return _apiServer;

  _apiServer = axios.create({
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  _apiServer.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Use getToken to read JWT directly from cookies (Server Side only)
      const headersList = await headers();
      const cookieStore = await cookies();
      const baseUrl = await getBaseUrl();
      
      // Update baseURL for this request
      config.baseURL = baseUrl;

      const req = {
        headers: Object.fromEntries(headersList.entries()),
        cookies: Object.fromEntries(
          cookieStore.getAll().map((c) => [c.name, c.value])
        ),
      };

      const token = await getToken({
        req: req as any,
        secret: process.env.NEXTAUTH_SECRET,
      });
      
      const hasError = token?.error === "RefreshAccessTokenError";
      const accessToken = token?.accessToken as string | undefined;

      // Do not redirect here! Let the layout or response interceptor handle auth errors.
      // We only clear cookies if we are absolutely sure we want to sign out.
      if (hasError) {
        // Only log or handle error, avoiding hard redirect in request interceptor
        console.warn("[API] Token refresh error detected in request");
      }

      if (config.headers && accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      if (config.data) console.log(`[API Request Data]`, config.data);
      if (config.params) console.log(`[API Request Params]`, config.params);

      return config;
    },
    (error) => {
      if (isRedirectError(error)) throw error;
      return Promise.reject(error);
    }
  );

  // Response Interceptor: 401 Rotation & Retry
  _apiServer.interceptors.response.use(
    (response) => {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url} - Status: ${response.status}`);
      console.log(`[API Response Data]`, response.data);
      return response;
    },
    async (error: AxiosError) => {
      // Always re-throw redirect errors so Next.js handles them
      if (isRedirectError(error)) throw error;

      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              const headersList = await headers();
              const cookieStore = await cookies();
              const req = {
                headers: Object.fromEntries(headersList.entries()),
                cookies: Object.fromEntries(
                  cookieStore.getAll().map((c) => [c.name, c.value])
                ),
              };

              const token = await getToken({
                req: req as any,
                secret: process.env.NEXTAUTH_SECRET,
              });
              
              const refreshToken = token?.refreshToken as string | undefined;

              if (!refreshToken) return null;

              const result = await refreshTokens(refreshToken);

              if (result?.success) {
                return result.data.access_token as string;
              }
            } catch (err) {
              console.error("[Auth] Token refresh failed:", err);
            } finally {
              refreshPromise = null;
            }
            return null;
          })();
        }

        const newToken = await refreshPromise;

        if (newToken) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return _apiServer!(originalRequest);
        }

        await clearAuthCookies();
        redirect("/auth/login");
      }

      const data = error.response?.data as ApiErrorResponse;
      const message = data?.message || error.message || "An unexpected error occurred";
      const formattedError = new Error(Array.isArray(message) ? message.join(", ") : message) as any;
      
      // Attach detail for easier usage in actions
      formattedError.response = error.response;

      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url} - Status: ${error.response?.status}`);
      if (error.response?.data) console.error(`[API Error Data]`, error.response.data);

      return Promise.reject(formattedError);
    }
  );

  return _apiServer;
};

export const apiServer = getApiServer();
