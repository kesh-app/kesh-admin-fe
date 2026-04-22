import { apiServer } from '@/libs/api-server.lib'
import { QrisDetailResponse } from '@/types/qris.type'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import QrisDetail from '@/components/transactions/qris-detail'
import QrisEvents from '@/components/transactions/qris-events'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { id } = await params
  
  let qrisData: QrisDetailResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<QrisDetailResponse>(`/v1/qris/${id}`)
    qrisData = response.data
  } catch (e: any) {
    console.error('Failed to fetch transaction detail:', e)
    error = e.message || 'Failed to load transaction details'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transactions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transaction Details</h1>
          <p className="text-muted-foreground mt-1">Detailed view of QRIS transaction</p>
        </div>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
          {error}
        </div>
      ) : qrisData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <QrisDetail transaction={qrisData.data} />
          </div>
          <div className="lg:col-span-1">
            <QrisEvents events={qrisData.data.events} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-8">
          Loading transaction details...
        </div>
      )}
    </div>
  )
}
