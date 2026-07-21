import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { VAListResponse } from '@/types/va-transaction.type'

import VATransactionsFilters from '@/components/va-transactions/va-transactions-filters'
import VATransactionsTable from '@/components/va-transactions/va-transactions-table'
import VATransactionsPagination from '@/components/va-transactions/va-transactions-pagination'

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

export default async function VATransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10

  const search = getStringParam(params.search)
  const status = getStringParam(params.status)
  const transactionDate = getStringParam(params.transactionDate)

  let vaData: VAListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<VAListResponse>('/v1/va-transactions', {
      params: {
        page,
        limit,

        search: search || undefined,
        status: status || undefined,

        fromDate: getStartOfDay(transactionDate),
        toDate: getEndOfDay(transactionDate),
      },
    })

    vaData = response.data
  } catch (e: any) {
    console.error('Failed to fetch VA transactions:', e)
    error = e.message || 'Failed to load VA transactions'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">VA Transactions</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor Virtual Account transactions
          </p>
        </div>
      </div>

      <VATransactionsFilters />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>Virtual Account Transactions</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : vaData ? (
            <>
              <VATransactionsTable transactions={vaData.data || []} />
              {vaData.meta && <VATransactionsPagination meta={vaData.meta} />}
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
