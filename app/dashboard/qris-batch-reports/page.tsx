import { Download } from 'lucide-react'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiServer, isRedirectError } from '@/libs/api-server.lib'
import type { ApiResponse } from '@/types/api.type'

type BatchStatus = 'SCHEDULED' | 'NOT_GENERATED' | 'PENDING' | 'PROCESSING' | 'DONE' | 'EMPTY' | 'FAILED'

interface QrisBatch {
  id: string | null
  batchNumber: number
  title: string
  startAt: string
  endAt: string
  scheduledAt: string
  generatedAt: string | null
  rowCount: number | null
  status: BatchStatus
}

const statusLabels: Record<BatchStatus, { label: string; variant: BadgeProps['variant'] }> = {
  SCHEDULED: { label: 'Scheduled', variant: 'outline' },
  NOT_GENERATED: { label: 'Not generated', variant: 'secondary' },
  PENDING: { label: 'Queued', variant: 'warning' },
  PROCESSING: { label: 'Processing', variant: 'info' },
  DONE: { label: 'Ready', variant: 'success' },
  EMPTY: { label: 'No transactions', variant: 'secondary' },
  FAILED: { label: 'Failed', variant: 'destructive' },
}

const timeZone = 'Asia/Jakarta'
const isoDate = new Intl.DateTimeFormat('en-CA', {
  timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const time = new Intl.DateTimeFormat('en-GB', {
  timeZone,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})
const dateTime = new Intl.DateTimeFormat('en-GB', {
  timeZone,
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const count = new Intl.NumberFormat('en-US')

export default async function QrisBatchReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>
}) {
  const { date: requestedDate } = await searchParams
  const today = isoDate.format(new Date())
  const date = typeof requestedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
    ? requestedDate
    : today

  let batches: QrisBatch[] | null = null

  try {
    const { data } = await apiServer.get<ApiResponse<QrisBatch[]>>('/v1/report/qris/batches', { params: { date } })
    if (data.success && Array.isArray(data.data)) batches = data.data
  } catch (error) {
    if (isRedirectError(error)) throw error
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">QRIS Batch Reports</h1>
        <p className="mt-2 text-muted-foreground">
          Two-hour QRIS reports are queued 30 minutes after each cutoff. All times are WIB.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="batch-date" className="text-sm font-medium">Report date</label>
          <Input id="batch-date" type="date" name="date" defaultValue={date} max={today} required />
        </div>
        <Button type="submit" variant="outline">View batches</Button>
      </form>

      <Card>
        <CardContent className="pt-6">
          {batches === null ? (
            <p role="alert" className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              Could not load QRIS batches. Select a report date and try again.
            </p>
          ) : batches.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No batches available for this date.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Batch</TableHead>
                  <TableHead scope="col">Transaction window</TableHead>
                  <TableHead scope="col">Scheduled</TableHead>
                  <TableHead scope="col">Generated</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col" className="text-right">Transactions</TableHead>
                  <TableHead scope="col" className="text-right">CSV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => {
                  const status = statusLabels[batch.status]
                  const downloadId = batch.status === 'DONE' && (batch.rowCount ?? 0) > 0 ? batch.id : null

                  return (
                    <TableRow key={batch.batchNumber}>
                      <TableCell className="whitespace-nowrap font-medium">{batch.title}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {time.format(new Date(batch.startAt))}–{time.format(new Date(batch.endAt).getTime() - 1000)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{dateTime.format(new Date(batch.scheduledAt))}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {batch.generatedAt ? dateTime.format(new Date(batch.generatedAt)) : '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={status?.variant ?? 'outline'}>{status?.label ?? batch.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {batch.rowCount === null ? '—' : count.format(batch.rowCount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {downloadId ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={`/api/report/qris/batches/${encodeURIComponent(downloadId)}/file`} aria-label={`Download ${batch.title} CSV`}>
                              <Download aria-hidden="true" className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
