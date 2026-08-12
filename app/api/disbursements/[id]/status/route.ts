import { NextResponse } from 'next/server'
import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()

    const payload: Record<string, unknown> = { status: body.status }
    if (body.reason) payload.reason = body.reason

    const response = await apiServer.patch(`/v1/disbursements/${id}/status`, payload)

    revalidatePath('/dashboard/disbursements')
    revalidatePath(`/dashboard/disbursements/${id}`)

    // Carries the callback delivery outcome back to the modal.
    return NextResponse.json({ success: true, data: response.data?.data ?? null })
  } catch (error: any) {
    console.error('API Route Error [Disbursement Status]:', error)
    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Failed to finalise disbursement',
      },
      { status: error.response?.status || 500 }
    )
  }
}
