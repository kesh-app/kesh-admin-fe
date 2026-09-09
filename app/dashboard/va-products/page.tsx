import { Metadata } from 'next'
import { getVaProductRoutes, getVaProducts } from './actions'
import VaProductFilters from '@/components/va-products/va-product-filters'
import VaProductTable from '@/components/va-products/va-product-table'
import VaProductPagination from '@/components/va-products/va-product-pagination'
import { Card, CardContent } from '@/components/ui/card'
import VaProductRoutingOverview from '@/components/va-products/va-product-routing-overview'
import {
  SMART_VA_GENERAL_CODES,
  SmartVaGeneralCode,
  VaProductRouteGroup,
} from '@/types/va-product.type'

export const metadata: Metadata = {
  title: 'VA Products',
  description: 'Manage virtual account products and Smart VA routing',
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
  const generalCodeParam = getStringParam(params?.general_code)
  const generalCode = SMART_VA_GENERAL_CODES.includes(generalCodeParam as SmartVaGeneralCode)
    ? (generalCodeParam as SmartVaGeneralCode)
    : undefined

  const [result, ...routeResults] = await Promise.all([
    getVaProducts({
      page,
      limit,
      search: search || undefined,
      provider: provider || undefined,
      general_code: generalCode,
    }),
    ...SMART_VA_GENERAL_CODES.map((code) => getVaProductRoutes(code)),
  ])

  const routeGroups: VaProductRouteGroup[] = SMART_VA_GENERAL_CODES.map((code, index) => {
    const routeResult = routeResults[index]
    return {
      generalCode: code,
      routes: routeResult.data,
      error: routeResult.success ? undefined : routeResult.message,
    }
  })

  const products = result.success ? result.data : []
  const meta = result.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">VA Products</h1>
          <p className="mt-1 text-muted-foreground">
            Manage provider products, eligibility, and Smart VA routing priority
          </p>
        </div>
      </div>

      <VaProductRoutingOverview
        key={routeGroups
          .flatMap((group) => group.routes.map((route) => `${route.id}:${route.routing_priority}:${route.is_routing_active}`))
          .join('|')}
        groups={routeGroups}
      />

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
