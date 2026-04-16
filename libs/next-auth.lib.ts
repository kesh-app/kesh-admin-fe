import { NextAuthOptions } from "next-auth";
import { getToken } from "next-auth/jwt";
import { headers, cookies } from "next/headers";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserData } from "@/types/auth.type";
import { apiServer, refreshTokens } from "@/libs/api-server.lib";

/**
 * Server-only helper to get the user data directly from the JWT.
 * This ensures we can prune the session object sent to the browser while
 * still having access to full user data in Server Components.
 */
export async function getServerUser() {
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

  return token?.user as UserData | undefined;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const refreshedTokens = await refreshTokens(token.refreshToken as string);

    if (!refreshedTokens.success) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.data.access_token,
      // Refreshed token expires in 24 hours
      accessTokenExpires: Date.now() + 23 * 3600 * 1000 + 55 * 60 * 1000, 
      refreshToken: refreshedTokens.data.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      user: {
        ...token.user,
        ...refreshedTokens.data
      } as any,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          const res = await apiServer.post("/v1/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          const result = res.data;

          if ((res.status === 200 || res.status === 201) && result?.success) {
            // Return the user data and tokens
            return {
              id: result?.data?.id,
              name: result?.data?.name,
              email: result?.data?.email,
              role: result?.data?.role,
              access_token: result?.data?.access_token,
              refresh_token: result?.data?.refresh_token,
            };
          }

          // Return null if user data could not be retrieved
          throw new Error(result.message || "Invalid credentials");
        } catch (error: any) {
          throw new Error(error.message || "Something went wrong during login");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.user = user as UserData;
        token.accessToken = (user as UserData).access_token;
        token.refreshToken = (user as UserData).refresh_token;
        // Access token expires in 24 hours (86400s), setting to slightly less for buffer
        token.accessTokenExpires = Date.now() + 23 * 3600 * 1000 + 55 * 60 * 1000; 
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // If we already have a refresh error, don't try again and let the client handle it
      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = {
          id: token.user.id,
          name: token.user.name,
          email: token.user.email,
          avatar_url: token.user.avatar_url,
        };
      }
      (session as any).error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (matching refresh token)
  },
  // Dynamic secret is handled by the caller or by falling back to NEXTAUTH_SECRET.
  // However, for NextAuth to work correctly with dynamic secrets, the route handler must provide it.
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Helper to get the auth options with the correct secret for the current environment.
 */
export async function getDynamicAuthOptions() {
  return authOptions;
}
