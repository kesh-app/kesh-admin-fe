'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function GlobalSettingSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const currentSearch = searchParams.get('search') || ''
    if (searchTerm === currentSearch) return

    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set('search', searchTerm)
      } else {
        params.delete('search')
      }
      // Reset limit on new search
      params.delete('limit')
      router.push(`${pathname}?${params.toString()}`)
    }, 400)

    return () => clearTimeout(delay)
  }, [searchTerm, pathname, router, searchParams])

  const handleClear = () => {
    setSearchTerm('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('limit')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search settings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8 pr-8"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
