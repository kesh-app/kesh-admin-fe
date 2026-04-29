import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { KYBListResponse } from '@/types/kyb.type'
import KYBTable from '@/components/kyb/kyb-table'
import KYBFilters from '@/components/kyb/kyb-filters'
import SubmerchantPagination from '@/components/submerchants/submerchant-pagination'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function KYBPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const search = (params.search as string) || ''
  const status = (params.status as string) || ''

  let kybData: KYBListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<KYBListResponse>('/v1/kyb', {
      params: {
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      },
    })
    kybData = response.data
  } catch (e: any) {
    console.error('Failed to fetch KYB submissions:', e)
    error = e.message || 'Failed to load KYB submissions'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KYB Management</h1>
          <p className="mt-1 text-muted-foreground">
            Review and approve merchant verification submissions (Know Your Business)
          </p>
        </div>
      </div>

      <KYBFilters />

      <Card>
        <CardHeader className="pb-7">
          <div className="flex items-center justify-between">
            <CardTitle>Submission List</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
              {error}
            </div>
          ) : kybData ? (
            <>
              <KYBTable data={kybData.data} />
              {kybData.meta && <SubmerchantPagination meta={kybData.meta} />}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading submissions...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
