import { NextRequest, NextResponse } from "next/server";
import { apiServer } from "@/libs/api-server.lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") || "10";
    const page = searchParams.get("page") || "1";

    const response = await apiServer.get("/v1/acquirers", {
      params: {
        search,
        limit,
        page,
        is_status: true, // Only active acquirers for selection
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[API Proxy] Failed to fetch acquirers:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch acquirers" },
      { status: error.response?.status || 500 }
    );
  }
}
