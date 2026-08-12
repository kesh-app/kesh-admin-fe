import { apiServer } from '@/libs/api-server.lib'
import { DisbursementDetailResponse } from '@/types/disbursement.type'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import DisbursementsDetail from '@/components/disbursements/disbursements-detail'
import DisbursementsEvents from '@/components/disbursements/disbursements-events'
import DisbursementDetailActions from '@/components/disbursements/disbursement-detail-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DisbursementDetailPage({ params }: PageProps) {
  const { id } = await params

  let disbursementData: DisbursementDetailResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<DisbursementDetailResponse>(
      `/v1/disbursements/${id}`,
    )
    disbursementData = response.data
  } catch (e: any) {
    console.error('Failed to fetch disbursement detail:', e)
    error = e.message || 'Failed to load disbursement details'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/disbursements">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Disbursement Details</h1>
          <p className="text-muted-foreground mt-1">
            Detailed view of the disbursement transaction
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
          {error}
        </div>
      ) : disbursementData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DisbursementsDetail disbursement={disbursementData.data} />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <DisbursementDetailActions disbursement={disbursementData.data} />
            <DisbursementsEvents events={disbursementData.data.events} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-8">
          Loading disbursement details...
        </div>
      )}
    </div>
  )
}
