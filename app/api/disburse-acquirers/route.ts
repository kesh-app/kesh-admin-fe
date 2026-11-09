import { NextRequest, NextResponse } from "next/server";
import { apiServer } from "@/libs/api-server.lib";
import { DisburseAcquirerListResponse } from "@/types/disburse-acquirer.type";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") || "50";
    const page = searchParams.get("page") || "1";

    const response = await apiServer.get<DisburseAcquirerListResponse>("/v1/disburse-acquirers", {
      params: {
        search,
        limit,
        page,
        is_status: true,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[API Proxy] Failed to fetch disburse acquirers:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch disburse acquirers" },
      { status: error.response?.status || 500 }
    );
  }
}
