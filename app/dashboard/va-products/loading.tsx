import { Card, CardContent } from '@/components/ui/card'

export default function VaProductsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading VA products">
      <div className="space-y-2">
        <div className="h-9 w-56 animate-pulse rounded bg-muted" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <div className="h-6 w-28 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="h-64 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}
