import { NextResponse } from "next/server";
import { apiServer } from "@/libs/api-server.lib";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await apiServer.get(`/v1/utils/downloads/${id}/url`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`API Route Error [Download URL ${id}]:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get download URL",
      },
      { status: error.response?.status || 500 }
    );
  }
}
