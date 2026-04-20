import axios from "axios";
import { signOut } from "next-auth/react";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error("[API Client] Unauthorized access detected. Signing out...");
      await signOut({ callbackUrl: "/auth/login", redirect: true });
    }
    return Promise.reject(error);
  }
);
