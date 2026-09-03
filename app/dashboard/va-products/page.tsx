import { Metadata } from 'next'
import { getVaProducts } from './actions'
import VaProductFilters from '@/components/va-products/va-product-filters'
import VaProductTable from '@/components/va-products/va-product-table'
import VaProductPagination from '@/components/va-products/va-product-pagination'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'VA Products',
  description: 'Manage virtual account products and fees',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function getStringParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export default async function VaProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const limit = Number(params?.limit) || 10

  const search = getStringParam(params?.search)
  const provider = getStringParam(params?.provider)

  const result = await getVaProducts({
    page,
    limit,
    search: search || undefined,
    provider: provider || undefined,
  })

  const products = result.success ? result.data : []
  const meta = result.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">VA Products</h1>
          <p className="mt-1 text-muted-foreground">
            Manage virtual account products, codes, and fee configurations
          </p>
        </div>
      </div>

      <VaProductFilters />

      <Card>
        <CardContent className="pt-6 space-y-4">
          {!result.success && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {result.message}
            </div>
          )}

          <VaProductTable products={products} />

          {meta && <VaProductPagination meta={meta} />}
        </CardContent>
      </Card>
    </div>
  )
}
