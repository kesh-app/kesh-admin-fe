import { apiServer } from '@/libs/api-server.lib'
import { VADetailResponse } from '@/types/va-transaction.type'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import VATransactionsDetail from '@/components/va-transactions/va-transactions-detail'
import VATransactionsEvents from '@/components/va-transactions/va-transactions-events'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VATransactionDetailPage({ params }: PageProps) {
  const { id } = await params

  let vaData: VADetailResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<VADetailResponse>(`/v1/va-transactions/${id}`)
    vaData = response.data
  } catch (e: any) {
    console.error('Failed to fetch VA transaction detail:', e)
    error = e.message || 'Failed to load VA transaction details'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/va-transactions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">VA Transaction Details</h1>
          <p className="text-muted-foreground mt-1">Detailed view of Virtual Account transaction</p>
        </div>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
          {error}
        </div>
      ) : vaData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VATransactionsDetail transaction={vaData.data} />
          </div>
          <div className="lg:col-span-1">
            <VATransactionsEvents events={vaData.data.events} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-8">
          Loading VA transaction details...
        </div>
      )}
    </div>
  )
}
