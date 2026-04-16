'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PaginationMeta } from '@/types/api.type'

interface AcquirerPaginationProps {
  meta: PaginationMeta
}

export default function AcquirerPagination({ meta }: AcquirerPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  if (meta.totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground font-medium">
        Showing page {meta.page} of {meta.totalPages} ({meta.total} total)
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(meta.page - 1)}
          disabled={!meta.hasPrev}
          className="h-8 rounded-md"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
            const pageNum = i + 1
            return (
              <Button
                key={pageNum}
                variant={meta.page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="h-8 w-8 p-0 rounded-md"
              >
                {pageNum}
              </Button>
            )
          })}
          {meta.totalPages > 5 && <span className="px-2 text-muted-foreground">...</span>}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(meta.page + 1)}
          disabled={!meta.hasNext}
          className="h-8 rounded-md"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
