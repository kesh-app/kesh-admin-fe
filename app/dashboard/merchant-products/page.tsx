import { Metadata } from 'next'
import { getMerchantProducts, getMerchantProductGroups } from './actions'
import MerchantProductFilters from '@/components/merchant-products/merchant-product-filters'
import MerchantProductTable from '@/components/merchant-products/merchant-product-table'
import MerchantProductPagination from '@/components/merchant-products/merchant-product-pagination'
import MerchantProductsTabs from '@/components/merchant-products/merchant-products-tabs'
import MerchantProductGroupFilters from '@/components/merchant-product-groups/merchant-product-group-filters'
import MerchantProductGroupTable from '@/components/merchant-product-groups/merchant-product-group-table'
import MerchantProductGroupPagination from '@/components/merchant-product-groups/merchant-product-group-pagination'
import { Card, CardContent } from '@/components/ui/card'

import { ProductType, GroupStatusType } from '@/types/merchant-product.type'

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

  const activeTab = getStringParam(params?.tab) || 'products'

  // --- Merchant Products params ---
  const page = Number(params?.page) || 1
  const limit = Number(params?.limit) || 10
  const search = getStringParam(params?.search)
  const provider = getStringParam(params?.provider)
  const type = getStringParam(params?.type) as ProductType | ''

  // --- Product Groups params ---
  const groupPage = Number(params?.groupPage) || 1
  const groupSearch = getStringParam(params?.groupSearch)
  const groupStatus = (getStringParam(params?.groupStatus) || 'all') as GroupStatusType
  const groupType = getStringParam(params?.groupType) as ProductType | ''

  // Fetch products (always needed: both as list for products tab, and as picker data for groups form)
  const productsResult = await getMerchantProducts({
    page,
    limit,
    search: search || undefined,
    provider: provider || undefined,
    type: type && ['VA', 'USER'].includes(type) ? (type as ProductType) : undefined,
  })

  // Fetch all products for the group form picker (no pagination — get a large list)
  const allProductsResult = await getMerchantProducts({ page: 1, limit: 500 })

  // Fetch product groups
  const groupsResult = await getMerchantProductGroups({
    page: groupPage,
    limit: 10,
    search: groupSearch || undefined,
    status: groupStatus,
    type: groupType && ['VA', 'USER'].includes(groupType) ? (groupType as ProductType) : undefined,
  })

  const products = productsResult.success ? productsResult.data : []
  const productsMeta = productsResult.meta

  const allProducts = allProductsResult.success ? allProductsResult.data : []

  const groups = groupsResult.success ? groupsResult.data : []
  const groupsMeta = groupsResult.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Merchant Products</h1>
          <p className="mt-1 text-muted-foreground">
            Manage merchant products, codes, fee configurations, and product groups
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <MerchantProductsTabs activeTab={activeTab} />

      {/* Tab: Merchant Products */}
      {activeTab === 'products' && (
        <>
          <MerchantProductFilters />

          <Card>
            <CardContent className="pt-6 space-y-4">
              {!productsResult.success && (
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                  {productsResult.message}
                </div>
              )}

              <MerchantProductTable products={products} />

              {productsMeta && <MerchantProductPagination meta={productsMeta} />}
            </CardContent>
          </Card>
        </>
      )}

      {/* Tab: Product Groups */}
      {activeTab === 'groups' && (
        <>
          <MerchantProductGroupFilters />

          <Card>
            <CardContent className="pt-6 space-y-4">
              {!groupsResult.success && (
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                  {groupsResult.message}
                </div>
              )}

              <MerchantProductGroupTable
                groups={groups}
                allProducts={allProducts}
              />

              {groupsMeta && <MerchantProductGroupPagination meta={groupsMeta} />}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
