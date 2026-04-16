import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { AcquirerListResponse } from '@/types/acquirer.type'

import AcquirerFilters from '@/components/acquirers/acquirer-filters'
import AcquirerTable from '@/components/acquirers/acquirer-table'
import AcquirerPagination from '@/components/acquirers/acquirer-pagination'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AcquirersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = (params.search as string) || ''
  const status = (params.status as string) || ''
  const limit = Number(params.limit) || 10

  let acquirersData: AcquirerListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<AcquirerListResponse>('/v1/acquirers', {
      params: {
        page,
        search: search || undefined,
        status: status || undefined,
        limit,
      },
    })
    acquirersData = response.data
  } catch (e: any) {
    console.error('Failed to fetch acquirers:', e)
    error = e.message || 'Failed to load acquirers'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Acquirers</h1>
          <p className="mt-1 text-muted-foreground">
            Manage payment acquirer integrations
          </p>
        </div>
        {/* <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Acquirer
        </Button> */}
      </div>

      <AcquirerFilters />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle>Bank Acquirers</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
              {error}
            </div>
          ) : acquirersData ? (
            <>
              <AcquirerTable acquirers={acquirersData.data} />
              {acquirersData.meta && <AcquirerPagination meta={acquirersData.meta} />}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading acquirers...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}