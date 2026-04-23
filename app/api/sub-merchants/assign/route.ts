import { NextRequest, NextResponse } from "next/server";
import { apiServer } from "@/libs/api-server.lib";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await apiServer.post("/v1/sub-merchants/assign", body);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[API Proxy] Failed to assign sub-merchant:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || error.message || "Failed to assign sub-merchant" 
      },
      { status: error.response?.status || 500 }
    );
  }
}
