import { NextResponse } from 'next/server'
import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const response = await apiServer.post(`/v1/qris/${id}/resend-callback`, {})

    console.log('API Route [QRIS Resend Callback] Response:', response.data)

    revalidatePath(`/dashboard/transactions/${id}`)

    return NextResponse.json({ success: true, data: response.data?.data ?? null })
  } catch (error: any) {
    console.error('API Route Error [QRIS Resend Callback]:', error)

    // error.message already contains the formatted message from the api-server interceptor
    // error.response?.data?.message is the raw message from the backend
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to resend callback'

    return NextResponse.json(
      {
        success: false,
        message: Array.isArray(message) ? message.join(', ') : String(message),
      },
      { status: error.response?.status || 500 }
    )
  }
}
