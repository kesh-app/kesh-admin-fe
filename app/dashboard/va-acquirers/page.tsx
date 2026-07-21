import { Metadata } from 'next'
import { getVaAcquirers } from './actions'
import VaAcquirerTable from '@/components/va-acquirers/va-acquirer-table'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'VA Acquirers',
  description: 'Manage virtual account acquirer configurations',
}

export default async function VaAcquirersPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string }
}) {
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 10
  
  const result = await getVaAcquirers(page, limit)
  const vaAcquirers = result.success ? result.data || [] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">VA Acquirers</h1>
          <p className="mt-1 text-muted-foreground">
            Manage virtual account acquirer configurations
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <VaAcquirerTable vaAcquirers={vaAcquirers} />
        </CardContent>
      </Card>
    </div>
  )
}
