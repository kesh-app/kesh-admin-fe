'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function KYBFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')

  useEffect(() => {
    const currentSearch = searchParams.get('search') || ''
    if (searchTerm === currentSearch) return

    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set('search', searchTerm)
      } else {
        params.delete('search')
      }
      params.set('page', '1') // Reset to page 1 on search
      router.push(`${pathname}?${params.toString()}`)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, pathname, router, searchParams])

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    const params = new URLSearchParams(searchParams.toString())
    if (newStatus) {
      params.set('status', newStatus)
    } else {
      params.delete('status')
    }
    params.set('page', '1') // Reset to page 1 on status change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setSearchTerm('')
    setStatus('')
    router.push(pathname)
  }

  return (
    <Card className="shadow-sm border-muted-foreground/10">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="text-sm font-semibold text-foreground block mb-2 uppercase tracking-slate-200">Search Submissions</label>
            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by company name, store name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 border-muted group-hover:border-muted-foreground/30 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <label className="text-sm font-semibold text-foreground block mb-2 uppercase tracking-slate-200">Status</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="flex h-11 w-full rounded-md border border-muted bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-muted-foreground/30"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || status) && (
            <Button variant="ghost" onClick={handleClear} className="h-11 text-muted-foreground hover:text-destructive">
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
