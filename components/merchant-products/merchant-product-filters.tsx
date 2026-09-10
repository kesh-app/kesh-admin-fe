'use client'

import { FormEvent, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, RotateCcw } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { VA_PRODUCT_CODES } from '@/libs/datas/va_product_code.data'

export default function VaProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [provider, setProvider] = useState(searchParams.get('provider') || '')

  const providers = VA_PRODUCT_CODES.map((item) => item.gateway_code)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '1')

    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }

    if (provider && provider !== 'ALL') {
      params.set('provider', provider)
    } else {
      params.delete('provider')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '1')

    if (newProvider && newProvider !== 'ALL') {
      params.set('provider', newProvider)
    } else {
      params.delete('provider')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch('')
    setProvider('')
    router.push(pathname)
  }

  const hasFilter = searchParams.has('search') || searchParams.has('provider')

  return (
    <div className="bg-card p-4 rounded-lg border">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="w-full sm:w-64">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Product name / Code"
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Provider
          </label>
          <select
            value={provider || 'ALL'}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
          >
            <option value="ALL">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="sm" className="h-9">
            Search
          </Button>

          {hasFilter && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
