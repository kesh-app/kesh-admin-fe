import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAcquirerById } from '../actions'
import { apiServer } from '@/libs/api-server.lib'
import { SubMerchantListResponse } from '@/types/sub-merchant.type'
import SubmerchantTable from '@/components/submerchants/submerchant-table'
import SubmerchantPagination from '@/components/submerchants/submerchant-pagination'
import AcquirerDetailInfo from '@/components/acquirers/acquirer-detail-info'

export const metadata: Metadata = {
  title: 'Acquirer Details | KESH Admin',
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AcquirerDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sParams = await searchParams
  const page = Number(sParams.page) || 1
  const search = (sParams.search as string) || ''
  const limit = Number(sParams.limit) || 10

  // Fetch acquirer details
  const acquirerRes = await getAcquirerById(id)
  if (!acquirerRes.success || !acquirerRes.data) {
    notFound()
  }

  const acquirer = acquirerRes.data

  // Fetch submerchants for this acquirer
  let submerchantsData: SubMerchantListResponse | null = null
  let submerchantError: string | null = null

  try {
    const response = await apiServer.get<SubMerchantListResponse>('/v1/sub-merchants', {
      params: {
        page,
        search: search || undefined,
        limit,
        acquirer_id: id,
      },
    })
    submerchantsData = response.data
  } catch (e: any) {
    console.error('Failed to fetch sub-merchants for acquirer:', e)
    submerchantError = e.message || 'Failed to load sub-merchants'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard/acquirers">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{acquirer.name}</h1>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <span className="text-sm font-bold text-primary">
            {submerchantsData?.meta?.total || 0} Sub merchants
          </span>
        </div>
      </div>

      <Card className="shadow-none border-muted">
        <CardHeader className="py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Acquirer Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <AcquirerDetailInfo acquirer={acquirer} />
        </CardContent>
      </Card>

      <Card className="shadow-none border-muted">
        <CardHeader className="py-3 bg-muted/30">
          <CardTitle className="text-sm font-medium">Associated Sub-merchants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {submerchantError ? (
            <div className="m-4 bg-destructive/10 text-destructive p-3 rounded text-xs">
              {submerchantError}
            </div>
          ) : submerchantsData ? (
            <div className="divide-y">
              <SubmerchantTable 
                submerchants={submerchantsData.data} 
                revalidatePath={`/dashboard/acquirers/${id}`}
                hideAcquirer={true}
              />
              <div className="p-4">
                {submerchantsData.meta && (
                  <SubmerchantPagination meta={submerchantsData.meta} />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-6">
              <p className="text-xs text-muted-foreground">Loading sub-merchants...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
