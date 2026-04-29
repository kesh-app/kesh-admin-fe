import { getDynamicAuthOptions } from "@/libs/next-auth.lib";
import NextAuth from "next-auth";
import { NextRequest } from "next/server";

type NextAuthRouteContext = {
  params: Promise<{
    nextauth: string[];
  }>;
};

const handler = async (req: NextRequest, ctx: NextAuthRouteContext) => {
  const options = await getDynamicAuthOptions();

  return NextAuth(req, ctx as any, options);
};

export { handler as GET, handler as POST };