'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function UserFilters() {
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="text-sm font-medium block mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email, or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium block mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-10 px-3 border border-input rounded-md bg-background text-sm"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Clear */}
          {(searchTerm || status) && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
