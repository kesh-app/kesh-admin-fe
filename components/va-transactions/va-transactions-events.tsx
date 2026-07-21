'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VATransactionEvent } from '@/types/va-transaction.type'
import { ClientDate } from '@/components/client-date'
import { CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, FileJson } from 'lucide-react'
import { useState } from 'react'

interface VATransactionsEventsProps {
  events?: VATransactionEvent[]
}

function EventItem({ event }: { event: VATransactionEvent }) {
  const [expanded, setExpanded] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-700 hover:bg-green-100'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
      case 'FAILED':
        return 'bg-red-100 text-red-700 hover:bg-red-100'
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100'
    }
  }

  return (
    <div className="relative pl-6">
      <div className="absolute -left-[11px] top-1 bg-background rounded-full">
        {getStatusIcon(event.transaction_status)}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="font-semibold text-sm">{event.source}</div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            <ClientDate date={event.created_at} format="PP pp" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(event.transaction_status)}>
            {event.transaction_status}
          </Badge>
          <span className="text-xs text-muted-foreground">Provider: {event.provider}</span>
        </div>

        {event.payload_raw && (
          <div className="mt-1 rounded-md border border-border/50 bg-muted/10 overflow-hidden">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span>View Payload Data</span>
              {expanded
                ? <ChevronUp className="h-3.5 w-3.5 ml-auto" />
                : <ChevronDown className="h-3.5 w-3.5 ml-auto" />
              }
            </button>
            {expanded && (
              <div className="bg-slate-950 p-3 overflow-x-auto">
                <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(event.payload_raw, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function VATransactionsEvents({ events }: VATransactionsEventsProps) {
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
            No events found for this transaction
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Timeline & Events</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative border-l border-muted-foreground/20 ml-4 mt-4 space-y-6">
          {events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
