'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { QrisPaymentStatus } from '@/types/qris.type'

export default function QrisFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') || '')
  const [toDate, setToDate] = useState(searchParams.get('toDate') || '')

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDateChange = (newFromDate: string, newToDate: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Only fetch if both are present OR both are empty (cleared)
    if ((newFromDate && newToDate) || (!newFromDate && !newToDate)) {
      if (newFromDate) params.set('fromDate', newFromDate)
      else params.delete('fromDate')
      
      if (newToDate) params.set('toDate', newToDate)
      else params.delete('toDate')
      
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const handleClear = () => {
    setStatus('')
    setFromDate('')
    setToDate('')
    router.push(pathname)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Status */}
          <div>
            <label className="text-sm font-medium block mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                handleFilterChange('status', e.target.value)
              }}
              className="h-10 w-full px-3 border border-input rounded-md bg-background text-sm"
            >
              <option value="">All Status</option>
              {Object.values(QrisPaymentStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="text-sm font-medium block mb-2">From Date</label>
            <div className="relative">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  const val = e.target.value
                  setFromDate(val)
                  handleDateChange(val, toDate)
                }}
              />
            </div>
          </div>

          {/* To Date */}
          <div>
            <label className="text-sm font-medium block mb-2">To Date</label>
            <div className="relative">
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  const val = e.target.value
                  setToDate(val)
                  handleDateChange(fromDate, val)
                }}
              />
            </div>
          </div>

          {/* Clear */}
          <div className="flex gap-2">
            {(status || fromDate || toDate) && (
              <Button variant="outline" onClick={handleClear} className="w-full">
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
