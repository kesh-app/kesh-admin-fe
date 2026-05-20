import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { QrisListResponse } from '@/types/qris.type'

import QrisFilters from '@/components/transactions/qris-filters'
import QrisTable from '@/components/transactions/qris-table'
import QrisPagination from '@/components/transactions/qris-pagination'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function getStringParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

function getStartOfDay(date?: string) {
  if (!date) return undefined
  return `${date}T00:00:00`
}

function getEndOfDay(date?: string) {
  if (!date) return undefined
  return `${date}T23:59:59`
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10

  const search = getStringParam(params.search)
  const status = getStringParam(params.status)
  const transactionDate = getStringParam(params.transactionDate)

  let qrisData: QrisListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<QrisListResponse>('/v1/qris', {
      params: {
        page,
        limit,

        search: search || undefined,
        status: status || undefined,

        // UI tetap 1 field Transaction Date,
        // backend tetap filter createdAt pakai range 1 hari penuh.
        fromDate: getStartOfDay(transactionDate),
        toDate: getEndOfDay(transactionDate),
      },
    })

    qrisData = response.data
  } catch (e: any) {
    console.error('Failed to fetch transactions:', e)
    error = e.message || 'Failed to load transactions'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor QRIS transactions
          </p>
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
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
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