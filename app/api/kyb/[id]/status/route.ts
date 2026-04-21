import { NextResponse } from 'next/server'
import { apiServer } from '@/libs/api-server.lib'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const formData = await request.formData()
    const status = formData.get('status') as string
    const reason = formData.get('reason') as string | null

    const payload: any = { status }
    if (status === 'rejected') {
      payload.reason = reason
    }

    await apiServer.patch(`/v1/kyb/${id}/status`, payload)
    
    // Trigger revalidation
    revalidatePath('/dashboard/kyb')
    revalidatePath(`/dashboard/kyb/${id}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Route Error [KYB Status]:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to update status' 
      },
      { status: error.response?.status || 500 }
    )
  }
}
