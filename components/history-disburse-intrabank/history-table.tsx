'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BalanceSweepEvent, BalanceSweepStatus } from '@/types/balance-sweep.type'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface HistoryTableProps {
  events: BalanceSweepEvent[]
}

const getStatusVariant = (status: BalanceSweepStatus) => {
  switch (status) {
    case 'SUCCESS':
      return 'success'
    case 'FAILED':
      return 'destructive'
    case 'SKIPPED':
      return 'warning'
    default:
      return 'default'
  }
}

export default function HistoryTable({ events }: HistoryTableProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partner Ref</TableHead>
            <TableHead>Source Account</TableHead>
            <TableHead>Beneficiary Account</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Payload</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {events.length > 0 ? (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium text-xs">
                  {event.partnerReferenceNo || '-'}
                </TableCell>
                
                <TableCell className="text-muted-foreground text-xs">
                  {event.sourceAccountNo || '-'}
                </TableCell>

                <TableCell className="text-muted-foreground text-xs">
                  {event.beneficiaryAccountNo || '-'}
                </TableCell>

                <TableCell className="text-xs">
                  {event.amountValue} {event.currency}
                </TableCell>

                <TableCell>
                  <Badge variant={getStatusVariant(event.status)}>
                    {event.status}
                  </Badge>
                  {event.responseMessage && (
                    <p className="text-[10px] text-muted-foreground mt-1 max-w-[150px] truncate" title={event.responseMessage}>
                      {event.responseMessage}
                    </p>
                  )}
                </TableCell>

                <TableCell className="text-muted-foreground text-xs">
                  {isMounted && event.createdAt ? format(new Date(event.createdAt), 'dd MMM yyyy HH:mm') : '-'}
                </TableCell>

                <TableCell className="text-right">
                  {isMounted && event.payloadRaw ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Raw Payload</DialogTitle>
                        </DialogHeader>
                        <div className="bg-muted p-4 rounded-md overflow-x-auto">
                          <pre className="text-xs">
                            {JSON.stringify(event.payloadRaw, null, 2)}
                          </pre>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No balance events found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
