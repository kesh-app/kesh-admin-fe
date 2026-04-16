'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PaginationMeta } from '@/types/api.type'

interface UserPaginationProps {
  meta: PaginationMeta
}

export default function UserPagination({ meta }: UserPaginationProps) {
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
      <div className="text-sm text-muted-foreground">
        Showing page {meta.page} of {meta.totalPages} ({meta.total} total)
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(meta.page - 1)}
          disabled={!meta.hasPrev}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
            // Simple logic for first 5 pages, can be improved for many pages
            const pageNum = i + 1
            return (
              <Button
                key={pageNum}
                variant={meta.page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
          {meta.totalPages > 5 && <span className="px-2">...</span>}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(meta.page + 1)}
          disabled={!meta.hasNext}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
