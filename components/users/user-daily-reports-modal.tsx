'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  TrendingUp,
  AlertCircle,
  Loader2,
  Download,
} from 'lucide-react'
import {
  fetchUserDailyReports,
  fetchDownloadUrl,
  FetchDailyReportsResult,
} from '@/app/dashboard/users/actions'
import { DailyReport } from '@/types/user.type'
import { PaginationMeta } from '@/types/api.type'
import { toast } from 'sonner'

interface UserDailyReportsModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export default function UserDailyReportsModal({
  userId,
  isOpen,
  onClose,
}: UserDailyReportsModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [reports, setReports] = useState<DailyReport[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [hasFetched, setHasFetched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Track loading state per download_job_id
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())

  const canFetch = !!startDate && !!endDate

  const doFetch = (targetPage: number) => {
    if (!canFetch) return
    setError(null)
    startTransition(async () => {
      const result: FetchDailyReportsResult = await fetchUserDailyReports(
        userId,
        startDate,
        endDate,
        targetPage,
        10
      )
      setHasFetched(true)
      if (result.success) {
        setReports(result.data)
        setMeta(result.meta)
        setPage(targetPage)
      } else {
        setError(result.message || 'Failed to fetch reports')
        setReports([])
        setMeta(null)
      }
    })
  }

  const handleFilter = () => {
    setPage(1)
    doFetch(1)
  }

  const handleClose = () => {
    setStartDate('')
    setEndDate('')
    setPage(1)
    setReports([])
    setMeta(null)
    setHasFetched(false)
    setError(null)
    setDownloadingIds(new Set())
    onClose()
  }

  const handleDownload = async (downloadJobId: string, reportDate: string) => {
    if (!downloadJobId) {
      toast.error('Download job ID tidak tersedia untuk laporan ini')
      return
    }

    setDownloadingIds((prev) => new Set(prev).add(downloadJobId))
    try {
      const result = await fetchDownloadUrl(downloadJobId)
      if (result.success && result.url) {
        // Open in new tab — triggers browser download
        window.open(result.url, '_blank', 'noopener,noreferrer')
        toast.success(`Laporan ${reportDate} siap diunduh`)
      } else {
        toast.error(result.message || 'Gagal mendapatkan URL unduhan')
      }
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev)
        next.delete(downloadJobId)
        return next
      })
    }
  }

  const totalPages = meta?.totalPages ?? 1

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <div className="p-2 rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Daily Reports
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Pilih rentang tanggal untuk melihat laporan harian transaksi.
          </p>
        </DialogHeader>

        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-border/30 bg-muted/20 shrink-0">
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
            <Button
              onClick={handleFilter}
              disabled={!canFetch || isPending}
              className="h-10 px-5 font-bold shadow-md shadow-primary/20 transition-all active:scale-95"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Fetch Reports
            </Button>
            {!canFetch && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 self-center">
                <CalendarRange className="h-3.5 w-3.5" />
                Pilih start date dan end date terlebih dahulu
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Not yet fetched state */}
          {!hasFetched && !isPending && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-4">
                <CalendarRange className="h-10 w-10 text-primary/30" />
              </div>
              <p className="font-semibold text-base">Belum ada data yang dimuat</p>
              <p className="text-sm opacity-60 mt-1">
                Pilih rentang tanggal lalu klik{' '}
                <span className="font-bold text-primary">Fetch Reports</span>
              </p>
            </div>
          )}

          {/* Loading state */}
          {isPending && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="font-semibold">Memuat laporan...</p>
            </div>
          )}

          {/* Error state */}
          {!isPending && hasFetched && error && (
            <div className="flex flex-col items-center justify-center py-16 text-destructive">
              <AlertCircle className="h-10 w-10 mb-3 opacity-60" />
              <p className="font-semibold">Gagal memuat laporan</p>
              <p className="text-sm opacity-70 mt-1">{error}</p>
            </div>
          )}

          {/* Table */}
          {!isPending && hasFetched && !error && (
            <>
              {/* Summary stats */}
              {meta && (
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>
                      Total{' '}
                      <span className="font-bold text-foreground">{meta.total}</span> laporan
                    </span>
                  </div>
                  <span className="text-border">|</span>
                  <span>
                    Halaman{' '}
                    <span className="font-bold text-foreground">{meta.page}</span> dari{' '}
                    <span className="font-bold text-foreground">{meta.totalPages}</span>
                  </span>
                </div>
              )}

              <div className="rounded-2xl overflow-hidden border border-border/50 shadow-lg">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow className="hover:bg-transparent border-primary/10">
                      <TableHead className="font-bold h-11 text-xs uppercase tracking-wider">
                        Report Date
                      </TableHead>
                      <TableHead className="font-bold h-11 text-xs uppercase tracking-wider">
                        Business Name
                      </TableHead>
                      <TableHead className="font-bold h-11 text-xs uppercase tracking-wider text-center">
                        Total Tx
                      </TableHead>
                      <TableHead className="font-bold h-11 text-xs uppercase tracking-wider text-center">
                        Success
                      </TableHead>
                      <TableHead className="font-bold h-11 text-xs uppercase tracking-wider text-center">
                        Pending
                      </TableHead>
                      <TableHead className="font-bold h-11 text-xs uppercase tracking-wider text-center">
                        Failed
                      </TableHead>
                      <TableHead className="font-bold h-11 text-xs uppercase tracking-wider text-right">
                        Total GMV
                      </TableHead>
                      <TableHead className="font-bold h-11 text-xs uppercase tracking-wider text-right">
                        Success GMV
                      </TableHead>
                      <TableHead className="font-bold h-11 text-xs uppercase tracking-wider text-center">
                        Download
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center text-muted-foreground py-16"
                        >
                          <div className="flex flex-col items-center gap-2 opacity-40">
                            <FileText className="h-8 w-8" />
                            <p>Tidak ada laporan pada rentang tanggal ini</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((item, idx) => {
                        const isDownloading = downloadingIds.has(item.download_job_id)
                        const hasJobId = !!item.download_job_id
                        const dateLabel = format(new Date(item.report_date), 'dd MMM yyyy')

                        return (
                          <TableRow
                            key={item.id}
                            className="hover:bg-muted/30 transition-colors"
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            <TableCell className="font-semibold text-sm">{dateLabel}</TableCell>
                            <TableCell className="text-sm">{item.business_name || '-'}</TableCell>
                            <TableCell className="text-center font-mono font-bold">
                              {item.total_tx}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="success"
                                className="px-2.5 rounded-full text-[10px] font-bold font-mono"
                              >
                                {item.success_tx}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="px-2.5 rounded-full text-[10px] font-bold font-mono border-orange-400/50 text-orange-500"
                              >
                                {item.pending_tx}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="destructive"
                                className="px-2.5 rounded-full text-[10px] font-bold font-mono"
                              >
                                {item.failed_tx}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium text-sm">
                              Rp {parseFloat(item.total_gmv).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-emerald-500 text-sm">
                              Rp {parseFloat(item.success_gmv).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-40"
                                disabled={!hasJobId || isDownloading}
                                onClick={() =>
                                  handleDownload(item.download_job_id, dateLabel)
                                }
                                title={
                                  !hasJobId
                                    ? 'Tidak ada file untuk diunduh'
                                    : `Unduh laporan ${dateLabel}`
                                }
                              >
                                {isDownloading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => doFetch(page - 1)}
                    disabled={page === 1 || isPending}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold min-w-[6rem] text-center">
                    Page {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => doFetch(page + 1)}
                    disabled={page === totalPages || isPending}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
