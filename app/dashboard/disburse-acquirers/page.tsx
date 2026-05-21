import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { DisburseAcquirerListResponse } from '@/types/disburse-acquirer.type'

import DisburseAcquirerFilters from '@/components/disburse-acquirers/disburse-acquirer-filters'
import DisburseAcquirerTable from '@/components/disburse-acquirers/disburse-acquirer-table'
import DisburseAcquirerPagination from '@/components/disburse-acquirers/disburse-acquirer-pagination'
import AddDisburseAcquirerButton from '@/components/disburse-acquirers/add-disburse-acquirer-button'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DisburseAcquirersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = (params.search as string) || ''
  const limit = Number(params.limit) || 10

  let acquirersData: DisburseAcquirerListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<DisburseAcquirerListResponse>('/v1/disburse-acquirers', {
      params: {
        page,
        search: search || undefined,
        limit,
      },
    })
    acquirersData = response.data
  } catch (e: any) {
    console.error('Failed to fetch disburse acquirers:', e)
    error = e.message || 'Failed to load disburse acquirers'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Disburse Acquirers</h1>
          <p className="mt-1 text-muted-foreground">
            Manage disbursement acquirer integrations
          </p>
        </div>
      </div>

      <DisburseAcquirerFilters />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle>Disburse Acquirers</CardTitle>
          <AddDisburseAcquirerButton />
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
              {error}
            </div>
          ) : acquirersData ? (
            <>
              <DisburseAcquirerTable disburseAcquirers={acquirersData.data} />
              {acquirersData.meta && <DisburseAcquirerPagination meta={acquirersData.meta} />}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading disburse acquirers...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
