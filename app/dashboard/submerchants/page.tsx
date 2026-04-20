import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { SubMerchantListResponse } from '@/types/sub-merchant.type'

import SubmerchantFilters from '@/components/submerchants/submerchant-filters'
import SubmerchantTable from '@/components/submerchants/submerchant-table'
import SubmerchantPagination from '@/components/submerchants/submerchant-pagination'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SubmerchantsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = (params.search as string) || ''
  const status = (params.status as string) || ''
  const limit = Number(params.limit) || 10

  let submerchantsData: SubMerchantListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<SubMerchantListResponse>('/v1/sub-merchants', {
      params: {
        page,
        search: search || undefined,
        is_status: status === 'true' ? true : status === 'false' ? false : undefined,
        limit,
      },
    })
    submerchantsData = response.data
  } catch (e: any) {
    console.error('Failed to fetch sub-merchants:', e)
    error = e.message || 'Failed to load sub-merchants'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sub-Merchants</h1>
          <p className="mt-1 text-muted-foreground">
            Manage merchant accounts and their acquirer relationship
          </p>
        </div>
      </div>

      <SubmerchantFilters />

      <Card>
        <CardHeader className="pb-7">
          <CardTitle>Sub-Merchant List</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
              {error}
            </div>
          ) : submerchantsData ? (
            <>
              <SubmerchantTable submerchants={submerchantsData.data} />
              {submerchantsData.meta && <SubmerchantPagination meta={submerchantsData.meta} />}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading sub-merchants...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}