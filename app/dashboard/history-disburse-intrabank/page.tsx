import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { BalanceSweepEventListResponse } from '@/types/balance-sweep.type'

import HistoryTable from '@/components/history-disburse-intrabank/history-table'
import HistoryPagination from '@/components/history-disburse-intrabank/history-pagination'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HistoryDisburseIntrabankPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10

  let eventsData: BalanceSweepEventListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<BalanceSweepEventListResponse>('/v1/balance-sweep-events', {
      params: {
        page,
        limit,
      },
    })
    eventsData = response.data
  } catch (e: any) {
    console.error('Failed to fetch balance events:', e)
    error = e.message || 'Failed to load balance events'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">History Disburse Intrabank</h1>
          <p className="mt-1 text-muted-foreground">
            View balance events and transaction status
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle>Sweep Events</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
              {error}
            </div>
          ) : eventsData ? (
            <>
              <HistoryTable events={eventsData.data} />
              {eventsData.meta && <HistoryPagination meta={eventsData.meta} />}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
