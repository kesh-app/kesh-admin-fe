import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { DisbursementListResponse } from '@/types/disbursement.type'

import DisbursementsFilters from '@/components/disbursements/disbursements-filters'
import DisbursementsTable from '@/components/disbursements/disbursements-table'
import DisbursementsPagination from '@/components/disbursements/disbursements-pagination'

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

export default async function DisbursementsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10

  const search = getStringParam(params.search)
  const status = getStringParam(params.status)
  const transactionDate = getStringParam(params.transactionDate)

  let disbursementData: DisbursementListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<DisbursementListResponse>('/v1/disbursements', {
      params: {
        page,
        limit,

        search: search || undefined,
        status: status || undefined,

        fromDate: getStartOfDay(transactionDate),
        toDate: getEndOfDay(transactionDate),
      },
    })

    disbursementData = response.data
  } catch (e: any) {
    console.error('Failed to fetch disbursements:', e)
    error = e.message || 'Failed to load disbursements'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Disbursements</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor BI-FAST, RTOL and Intrabank disbursements, and settle the pending ones
          </p>
        </div>
      </div>

      <DisbursementsFilters />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>Disbursement Transactions</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : disbursementData ? (
            <>
              <DisbursementsTable disbursements={disbursementData.data || []} />
              {disbursementData.meta && (
                <DisbursementsPagination meta={disbursementData.meta} />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              Loading disbursements...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
