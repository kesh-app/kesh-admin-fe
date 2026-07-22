'use client'

import { useState, useTransition, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Landmark,
  Loader2,
  Search,
  X,
  TrendingDown,
  TrendingUp,
  Clock,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react'
import { updateUserVABalance, fetchUserVABalanceHistories } from '@/app/dashboard/users/actions'
import { UpdateVABalancePayload, BalanceHistory, VABalances } from '@/types/user.type'
import { PaginationMeta } from '@/types/api.type'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ClientDate } from '@/components/client-date'

interface UserVABalanceDetailModalProps {
  userId: string
  vaBalances: VABalances | null
  isOpen: boolean
  onClose: () => void
}

export default function UserVABalanceDetailModal({
  userId,
  vaBalances,
  isOpen,
  onClose,
}: UserVABalanceDetailModalProps) {
  const [fundType, setFundType] = useState<'DEBIT' | 'CREDIT'>('CREDIT')
  const [amount, setAmount] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [histories, setHistories] = useState<BalanceHistory[]>([])
  const [historiesMeta, setHistoriesMeta] = useState<PaginationMeta | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const currentBalance = parseFloat(vaBalances?.available_balance || '0')

  const handleClose = () => {
    setFundType('CREDIT')
    setAmount('')
    setReason('')
    setStartDate('')
    setEndDate('')
    setHistories([])
    setHistoriesMeta(null)
    setHistoryError(null)
    setHasSearched(false)
    setCurrentPage(1)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amountNumber = parseFloat(amount) || 0

    if (!amount || amountNumber <= 0) {
      toast.error('Jumlah amount harus lebih dari 0')
      return
    }

    if (fundType === 'DEBIT' && amountNumber > currentBalance) {
      toast.error('Balance tidak mencukupi untuk pengurangan')
      return
    }

    startTransition(async () => {
      const payload: UpdateVABalancePayload = {
        fund_type: fundType,
        amount: Number(amount.trim()),
        reason: reason.trim() || undefined,
      }

      const result = await updateUserVABalance(userId, payload)

      if (result.success) {
        toast.success(result.message)
        router.refresh()
        setAmount('')
        setReason('')
        if (hasSearched && startDate && endDate) {
          fetchHistory(currentPage)
        }
      } else {
        toast.error(result.message)
      }
    })
  }

  const fetchHistory = useCallback(async (page: number) => {
    if (!startDate || !endDate) return
    setIsLoadingHistory(true)
    setHistoryError(null)
    try {
      const result = await fetchUserVABalanceHistories(userId, startDate, endDate, page, 10)
      if (result.success) {
        setHistories(result.data)
        setHistoriesMeta(result.meta)
        setCurrentPage(page)
      } else {
        setHistoryError(result.message || 'Failed to fetch VA balance history')
      }
    } catch {
      setHistoryError('Failed to fetch VA balance history')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [userId, startDate, endDate])

  const handleSearchHistory = () => {
    if (!startDate || !endDate) {
      toast.error('Start date dan end date harus diisi')
      return
    }
    setHasSearched(true)
    fetchHistory(1)
  }

  const handleClearHistory = () => {
    setStartDate('')
    setEndDate('')
    setHistories([])
    setHistoriesMeta(null)
    setHistoryError(null)
    setHasSearched(false)
    setCurrentPage(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Landmark className="h-5 w-5 text-violet-500" />
            VA Balance — Detail
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Current VA Balance Info */}
          <div className="bg-violet-500/5 px-5 py-4 rounded-xl border border-violet-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Available Balance</span>
              <span className="text-lg font-black text-violet-600">
                Rp {currentBalance.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
              <span className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                Gateway: <span className="font-semibold ml-1">{vaBalances?.gateway_code || '-'}</span>
              </span>
              <span>
                Status: <Badge variant={vaBalances?.status === 'ACTIVE' ? 'success' : 'secondary'} className="rounded-full text-[10px] font-bold px-2 ml-1">{vaBalances?.status || '-'}</Badge>
              </span>
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit} className="border border-border/50 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Update VA Balance</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Tipe Penyesuaian</label>
                <select
                  value={fundType}
                  onChange={(e) => setFundType(e.target.value as 'DEBIT' | 'CREDIT')}
                  className="w-full h-10 px-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm"
                  disabled={isPending}
                >
                  <option value="CREDIT">CREDIT (Penambahan Balance)</option>
                  <option value="DEBIT">DEBIT (Pengurangan Balance)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Misal: 10000.00"
                  min="0.01"
                  step="0.01"
                  className="w-full h-10 px-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-sm"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Alasan (Reason) <span className="text-muted-foreground font-normal">— optional</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Admin manual topup VA balance"
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none text-sm"
                disabled={isPending}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isPending} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Submit Update'
                )}
              </Button>
            </div>
          </form>

          {/* VA Balance History */}
          <div className="border border-border/50 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4" />
              VA Balance History
            </h3>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSearchHistory}
                  disabled={isLoadingHistory || !startDate || !endDate}
                  className="h-9 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isLoadingHistory ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Search className="h-4 w-4 mr-1" />
                  )}
                  Search
                </Button>
                {hasSearched && (
                  <Button type="button" size="sm" variant="outline" onClick={handleClearHistory} className="h-9">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {!hasSearched && (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                <CalendarRange className="h-7 w-7 mb-2 opacity-30" />
                <p className="text-sm">Pilih range tanggal untuk melihat history VA balance</p>
              </div>
            )}

            {hasSearched && historyError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{historyError}</div>
            )}

            {hasSearched && !historyError && (
              <div className={`rounded-xl border overflow-hidden transition-opacity ${isLoadingHistory ? 'opacity-50' : ''}`}>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs">Date</TableHead>
                      <TableHead className="font-bold text-xs">Description</TableHead>
                      <TableHead className="font-bold text-xs text-right">Debit</TableHead>
                      <TableHead className="font-bold text-xs text-right">Credit</TableHead>
                      <TableHead className="font-bold text-xs text-right">Balance</TableHead>
                      <TableHead className="font-bold text-xs text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {histories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                          No VA balance history found for this date range
                        </TableCell>
                      </TableRow>
                    ) : (
                      histories.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            <ClientDate date={item.createdAt} format="dd MMM yyyy HH:mm" />
                          </TableCell>
                          <TableCell className="text-sm">{item.description}</TableCell>
                          <TableCell className="text-right font-mono text-destructive text-sm">
                            {item.debit > 0 ? (
                              <span className="flex items-center justify-end gap-1">
                                <TrendingDown className="h-3 w-3" />
                                Rp {item.debit.toLocaleString('id-ID')}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-emerald-500 text-sm">
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
                              <span className="font-mono font-bold text-sm text-violet-600">
                                Rp {item.endingBalance.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={item.status === 'SUCCESS' ? 'success' : 'secondary'}
                              className="px-2 rounded-full text-[10px] font-bold uppercase"
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {historiesMeta && historiesMeta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">
                  Page {historiesMeta.page} of {historiesMeta.totalPages} ({historiesMeta.total} total)
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchHistory(historiesMeta.page - 1)}
                    disabled={!historiesMeta.hasPrev || isLoadingHistory}
                    className="h-8 px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchHistory(historiesMeta.page + 1)}
                    disabled={!historiesMeta.hasNext || isLoadingHistory}
                    className="h-8 px-3"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
