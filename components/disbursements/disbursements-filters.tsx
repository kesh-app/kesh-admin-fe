'use client'

import { FormEvent, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function DisbursementsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [transactionDate, setTransactionDate] = useState(
    searchParams.get('transactionDate') || '',
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    params.set('page', '1')

    // Date stays optional here: pending transfers are hunted by status, not by day,
    // and the API already defaults to the last month when no range is given.
    if (transactionDate) {
      params.set('transactionDate', transactionDate)
    } else {
      params.delete('transactionDate')
    }

    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }

    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    setStatus('')
    setTransactionDate('')

    router.push(pathname)
  }

  const hasFilter =
    searchParams.get('search') ||
    searchParams.get('status') ||
    searchParams.get('transactionDate')

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Search</label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Partner ref / reference / beneficiary"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Transaction Date
              </label>

              <Input
                type="date"
                value={transactionDate}
                onChange={(event) => setTransactionDate(event.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Search
              </Button>

              {hasFilter && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
