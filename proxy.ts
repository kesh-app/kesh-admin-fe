import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware logic to handle route guarding and session validation.
 */
export async function proxy(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET as string 
  });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");
  // The dashboard is at the root "/" and other sub-pages
  const isProtectedPage = !isAuthPage && !pathname.startsWith("/api") && !pathname.startsWith("/_next");
  const hasError = token?.error === "RefreshAccessTokenError";

  // 1. If accessing auth pages but already logged in, redirect to dashboard (projects)
  if (token && !hasError && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. If accessing protected pages but NOT logged in (or session error), redirect to login
  if ((!token || hasError) && isProtectedPage) {
    const response = NextResponse.redirect(new URL("/auth/login", req.url));
    
    // Clear invalid session tokens to prevent loops
    if (hasError) {
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.session-token");
      response.cookies.delete("next-auth.pkce.code_verifier");
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Update matcher to protect the root and other directories
  matcher: [
    "/",
    "/projects/:path*",
    "/users/:path*",
    "/acquirers/:path*",
    "/submerchants/:path*",
    "/auth/:path*",
  ],
};
