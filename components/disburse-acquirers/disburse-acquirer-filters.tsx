'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function DisburseAcquirerFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

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
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, pathname, router, searchParams])

  const handleClear = () => {
    setSearchTerm('')
    router.push(pathname)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium block mb-2 text-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {searchTerm && (
            <Button variant="outline" onClick={handleClear}>
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
