import { NextRequest, NextResponse } from "next/server";
import { apiServer } from "@/libs/api-server.lib";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const requestedFilename = searchParams.get("filename");

  try {
    // 1. Get pre-signed download URL from backend
    const response = await apiServer.get(`/v1/utils/downloads/${id}/url`);
    const presignedUrl = response.data?.data?.url || response.data?.url;

    if (!presignedUrl) {
      return NextResponse.json(
        { success: false, message: "Download URL not available" },
        { status: 404 }
      );
    }

    // 2. Fetch the file content from OBS/storage
    const fileRes = await fetch(presignedUrl);
    if (!fileRes.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch file from storage" },
        { status: fileRes.status }
      );
    }

    // Determine filename
    let filename = requestedFilename;
    if (!filename) {
      try {
        const urlObj = new URL(presignedUrl);
        const pathSegments = urlObj.pathname.split("/");
        filename = pathSegments[pathSegments.length - 1] || `report_${id}.csv`;
      } catch {
        filename = `report_${id}.csv`;
      }
    }

    if (!filename.toLowerCase().endsWith(".csv")) {
      filename = `${filename.replace(/\.[^/.]+$/, "")}.csv`;
    }

    const fileBuffer = await fileRes.arrayBuffer();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error(`Forwarder Error [Download CSV ${id}]:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to forward CSV file",
      },
      { status: error.response?.status || 500 }
    );
  }
}
