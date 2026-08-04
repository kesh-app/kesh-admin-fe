import { NextResponse } from "next/server";
import { apiServer } from "@/libs/api-server.lib";
import { revalidatePath } from "next/cache";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const { admin_notes } = body;

    const payload: { admin_notes?: string } = {};
    if (admin_notes && typeof admin_notes === "string" && admin_notes.trim()) {
      payload.admin_notes = admin_notes.trim();
    }

    const response = await apiServer.post(`/v1/balance-requests/${id}/reject`, payload);

    revalidatePath("/dashboard/balance-requests");

    return NextResponse.json(response.data || { success: true });
  } catch (error: any) {
    console.error(`API Route Error [Reject Balance Request ${id}]:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to reject balance request",
      },
      { status: error.response?.status || 500 }
    );
  }
}
