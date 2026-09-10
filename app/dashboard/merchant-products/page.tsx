import { Metadata } from 'next'
import { getMerchantProducts } from './actions'
import MerchantProductFilters from '@/components/merchant-products/merchant-product-filters'
import MerchantProductTable from '@/components/merchant-products/merchant-product-table'
import MerchantProductPagination from '@/components/merchant-products/merchant-product-pagination'
import { Card, CardContent } from '@/components/ui/card'

import { ProductType } from '@/types/merchant-product.type'

export const metadata: Metadata = {
  title: 'Merchant Products',
  description: 'Manage merchant products and fees',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function getStringParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export default async function MerchantProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const limit = Number(params?.limit) || 10

  const search = getStringParam(params?.search)
  const provider = getStringParam(params?.provider)
  const type = getStringParam(params?.type) as ProductType | ''

  const result = await getMerchantProducts({
    page,
    limit,
    search: search || undefined,
    provider: provider || undefined,
    type: type && ['VA', 'USER'].includes(type) ? (type as ProductType) : undefined,
  })

  const products = result.success ? result.data : []
  const meta = result.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Merchant Products</h1>
          <p className="mt-1 text-muted-foreground">
            Manage merchant products, codes, and fee configurations
          </p>
        </div>
      </div>

      <MerchantProductFilters />

      <Card>
        <CardContent className="pt-6 space-y-4">
          {!result.success && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {result.message}
            </div>
          )}

          <MerchantProductTable products={products} />

          {meta && <MerchantProductPagination meta={meta} />}
        </CardContent>
      </Card>
    </div>
  )
}
