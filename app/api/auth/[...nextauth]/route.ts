import { getDynamicAuthOptions } from "@/libs/next-auth.lib";
import NextAuth from "next-auth";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest, ctx: { params: { nextauth: string[] } }) => {
  const options = await getDynamicAuthOptions();
  return await NextAuth(req, ctx, options);
};

export { handler as GET, handler as POST };
