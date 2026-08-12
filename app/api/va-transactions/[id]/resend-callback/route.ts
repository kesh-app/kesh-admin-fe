import { NextResponse } from 'next/server'
import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const response = await apiServer.post(`/v1/va-transactions/${id}/resend-callback`, {})

    revalidatePath(`/dashboard/va-transactions/${id}`)

    return NextResponse.json({ success: true, data: response.data?.data ?? null })
  } catch (error: any) {
    console.error('API Route Error [VA Transaction Resend Callback]:', error)
    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Failed to resend callback',
      },
      { status: error.response?.status || 500 }
    )
  }
}
