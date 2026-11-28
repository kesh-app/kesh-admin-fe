import { Readable } from 'node:stream'
import { NextResponse } from 'next/server'
import { apiServer, isRedirectError } from '@/libs/api-server.lib'

const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ message: 'Invalid batch ID' }, { status: 400 })
  }

  try {
    const upstream = await apiServer.get<Readable>(`/v1/report/qris/batches/${id}/file`, {
      responseType: 'stream',
      signal: request.signal,
      maxRedirects: 0,
      validateStatus: () => true,
    })
    const contentType = upstream.headers['content-type']
    const disposition = upstream.headers['content-disposition']

    if (upstream.status !== 200 || typeof contentType !== 'string' || !contentType.startsWith('text/csv') || typeof disposition !== 'string') {
      upstream.data.destroy()
      const status = [401, 403, 404].includes(upstream.status) ? upstream.status : 502
      const message = status === 404 ? 'This batch has no CSV available' : 'Could not download QRIS batch'
      return NextResponse.json({ message }, { status, headers: { 'Cache-Control': 'private, no-store' } })
    }

    return new NextResponse(Readable.toWeb(upstream.data) as ReadableStream<Uint8Array>, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    if (isRedirectError(error)) throw error
    return NextResponse.json({ message: 'Could not download QRIS batch' }, { status: 502 })
  }
}
