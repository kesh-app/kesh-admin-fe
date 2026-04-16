"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

/**
 * SessionWatcher component monitors the NextAuth session for errors.
 * If a RefreshAccessTokenError is detected (indicating token rotation failed),
 * it triggers an automatic sign-out and redirects to the login page.
 */
export default function SessionWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session && (session as any).error === "RefreshAccessTokenError") {
      console.error("[Auth] Session rotation failed. Redirecting to login...");
      
      // Clear session and redirect to login
      signOut({ 
        callbackUrl: "/auth/login", 
        redirect: true 
      });
    }
  }, [session]);

  return null;
}
