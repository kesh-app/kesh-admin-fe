'use client'

import { FormEvent, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, RotateCcw } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function MerchantProductGroupFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('groupSearch') || '')
  const [status, setStatus] = useState(searchParams.get('groupStatus') || 'all')
  const [type, setType] = useState(searchParams.get('groupType') || '')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'groups')
    params.set('groupPage', '1')

    if (search.trim()) {
      params.set('groupSearch', search.trim())
    } else {
      params.delete('groupSearch')
    }

    if (status && status !== 'all') {
      params.set('groupStatus', status)
    } else {
      params.delete('groupStatus')
    }

    if (type && type !== 'ALL') {
      params.set('groupType', type)
    } else {
      params.delete('groupType')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'groups')
    params.set('groupPage', '1')

    if (newStatus && newStatus !== 'all') {
      params.set('groupStatus', newStatus)
    } else {
      params.delete('groupStatus')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'groups')
    params.set('groupPage', '1')

    if (newType && newType !== 'ALL') {
      params.set('groupType', newType)
    } else {
      params.delete('groupType')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setType('')
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'groups')
    params.delete('groupSearch')
    params.delete('groupStatus')
    params.delete('groupType')
    params.delete('groupPage')
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasFilter =
    searchParams.has('groupSearch') ||
    (searchParams.has('groupStatus') && searchParams.get('groupStatus') !== 'all') ||
    searchParams.has('groupType')

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
              placeholder="Group name..."
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="w-full sm:w-36">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="w-full sm:w-36">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Type
          </label>
          <select
            value={type || 'ALL'}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
          >
            <option value="ALL">All Types</option>
            <option value="VA">VA</option>
            <option value="USER">USER</option>
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
