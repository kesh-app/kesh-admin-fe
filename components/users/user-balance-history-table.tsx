'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X, ChevronLeft, ChevronRight, CalendarRange, Clock, TrendingDown, TrendingUp } from 'lucide-react'
import { ClientDate } from '@/components/client-date'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BalanceHistory } from '@/types/user.type'
import { PaginationMeta } from '@/types/api.type'

interface UserBalanceHistoryTableProps {
  histories: BalanceHistory[]
  historiesMeta: PaginationMeta | null
  userId: string
  currentPage: number
  currentLimit: number
  currentStartDate: string
  currentEndDate: string
}

function SkeletonRow() {
  return (
    <TableRow className="hover:bg-transparent">
      {[1, 2, 3, 4, 5].map((i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${50 + (i * 15) % 40}%` }} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export default function UserBalanceHistoryTable({
  histories,
  historiesMeta,
  currentPage,
  currentLimit,
  currentStartDate,
  currentEndDate,
}: UserBalanceHistoryTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [startDate, setStartDate] = useState(currentStartDate)
  const [endDate, setEndDate] = useState(currentEndDate)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setIsNavigating(false)
    setStartDate(currentStartDate)
    setEndDate(currentEndDate)
  }, [currentPage, currentLimit, currentStartDate, currentEndDate])

  const buildUrl = useCallback(
    (overrides: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      const merged = {
        bhPage: currentPage,
        bhLimit: currentLimit,
        start_date: currentStartDate,
        end_date: currentEndDate,
        ...overrides,
      }
      Object.entries(merged).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== null) {
          params.set(key, String(val))
        } else {
          params.delete(key)
        }
      })
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams, currentPage, currentLimit, currentStartDate, currentEndDate]
  )

  const navigate = useCallback(
    (overrides: Record<string, string | number | undefined>) => {
      setIsNavigating(true)
      router.push(buildUrl(overrides), { scroll: false })
    },
    [router, buildUrl]
  )

  const handleFilter = useCallback(() => {
    navigate({ start_date: startDate || undefined, end_date: endDate || undefined, bhPage: 1 })
  }, [navigate, startDate, endDate])

  const handleClearFilter = useCallback(() => {
    setStartDate('')
    setEndDate('')
    navigate({ start_date: undefined, end_date: undefined, bhPage: 1 })
  }, [navigate])

  const handlePageChange = (newPage: number) => {
    navigate({ bhPage: newPage })
  }

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-72 rounded bg-muted/70 animate-pulse" />
          </div>
        </div>
        <div className="border-none shadow-2xl rounded-2xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-primary/2">
              <TableRow className="hover:bg-transparent border-primary/10">
                {['Date', 'Description', 'Debit', 'Credit', 'Balances'].map((h) => (
                  <TableHead key={h} className="font-bold h-12">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const meta = historiesMeta

  return (
    <div className="space-y-4 pt-4">
      {/* Header & Filter */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-1">
        <div className="space-y-1">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Balance History
            {meta && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {meta.total}
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            View transaction logs and manual balance updates.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleFilter}
              disabled={isNavigating || (!startDate && !endDate)}
              className="h-10 px-5 font-bold shadow-md shadow-primary/20 transition-all active:scale-95"
            >
              {isNavigating ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Loading
                </span>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Filter
                </>
              )}
            </Button>
            {(startDate || endDate) && (
              <Button
                variant="outline"
                onClick={handleClearFilter}
                disabled={isNavigating}
                className="h-10 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`border-none shadow-2xl rounded-2xl overflow-hidden bg-card transition-opacity duration-200 ${isNavigating ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        <Table>
          <TableHeader className="bg-primary/2">
            <TableRow className="hover:bg-transparent border-primary/10">
              <TableHead className="font-bold h-12 w-[180px]">Date</TableHead>
              <TableHead className="font-bold h-12 min-w-[200px]">Description</TableHead>
              <TableHead className="font-bold h-12 text-right">Debit</TableHead>
              <TableHead className="font-bold h-12 text-right">Credit</TableHead>
              <TableHead className="font-bold h-12 text-right">Balance</TableHead>
              <TableHead className="font-bold h-12 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isNavigating ? (
              Array.from({ length: currentLimit }).map((_, i) => <SkeletonRow key={i} />)
            ) : histories.length > 0 ? (
              histories.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    <ClientDate date={item.createdAt} format="dd MMM yyyy HH:mm:ss" />
                  </TableCell>
                  
                  <TableCell className="font-medium text-sm">
                    {item.description}
                  </TableCell>

                  <TableCell className="text-right font-mono font-medium text-destructive">
                    {item.debit > 0 ? (
                      <span className="flex items-center justify-end gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Rp {item.debit.toLocaleString('id-ID')}
                      </span>
                    ) : '-'}
                  </TableCell>

                  <TableCell className="text-right font-mono font-medium text-emerald-500">
                    {item.credit > 0 ? (
                      <span className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Rp {item.credit.toLocaleString('id-ID')}
                      </span>
                    ) : '-'}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-xs text-muted-foreground line-through">
                        Rp {item.beginningBalance.toLocaleString('id-ID')}
                      </span>
                      <span className="font-mono font-bold text-sm text-primary">
                        Rp {item.endingBalance.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant={item.status === 'SUCCESS' ? 'success' : 'secondary'}
                      className="px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <CalendarRange className="h-8 w-8" />
                    <p>
                      {(currentStartDate || currentEndDate)
                        ? 'No balance history found for the selected date range'
                        : 'No balance history found'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}{' '}
            <span className="text-muted-foreground/60">({meta.total} total)</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={!meta.hasPrev || isNavigating}
              className="h-8 px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                let pageNum: number
                if (meta.totalPages <= 5) {
                  pageNum = i + 1
                } else if (meta.page <= 3) {
                  pageNum = i + 1
                } else if (meta.page >= meta.totalPages - 2) {
                  pageNum = meta.totalPages - 4 + i
                } else {
                  pageNum = meta.page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={meta.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isNavigating}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={!meta.hasNext || isNavigating}
              className="h-8 px-3"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
