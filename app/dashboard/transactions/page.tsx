import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { QrisListResponse } from '@/types/qris.type'

import QrisFilters from '@/components/transactions/qris-filters'
import QrisTable from '@/components/transactions/qris-table'
import QrisPagination from '@/components/transactions/qris-pagination'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const status = (params.status as string) || ''
  const limit = Number(params.limit) || 10
  const fromDate = (params.fromDate as string) || ''
  const toDate = (params.toDate as string) || ''

  let qrisData: QrisListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<QrisListResponse>('/v1/qris', {
      params: {
        page,
        status: status || undefined,
        limit,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      },
    })
    qrisData = response.data
  } catch (e: any) {
    console.error('Failed to fetch transactions:', e)
    error = e.message || 'Failed to load transactions'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-2">Monitor QRIS transactions</p>
        </div>
      </div>

      <QrisFilters />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>QRIS Transactions</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
              {error}
            </div>
          ) : qrisData ? (
            <>
              <QrisTable transactions={qrisData.data} />
              {qrisData.meta && <QrisPagination meta={qrisData.meta} />}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              Loading transactions...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
