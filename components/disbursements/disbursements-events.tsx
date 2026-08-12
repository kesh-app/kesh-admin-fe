'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DisbursementEvent } from '@/types/disbursement.type'
import { ClientDate } from '@/components/client-date'
import { CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, FileJson } from 'lucide-react'
import { useState } from 'react'
import { getDisbursementStatusColor, labelEventStatus } from './disbursement-status'

interface DisbursementsEventsProps {
  events?: DisbursementEvent[]
}

function EventItem({ event }: { event: DisbursementEvent }) {
  const [expanded, setExpanded] = useState(false)

  const status = labelEventStatus(event.transactionStatus)

  const getStatusIcon = () => {
    switch (status) {
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

  // Manual finalisations and callback deliveries tag themselves in the payload.
  const trigger = event.payloadRaw?.trigger as string | undefined
  const sourceLabel =
    trigger === 'MANUAL_ADMIN'
      ? 'MANUAL (ADMIN)'
      : trigger === 'MANUAL_ADMIN_CALLBACK'
        ? 'MERCHANT CALLBACK'
        : 'PROVIDER'

  return (
    <div className="relative pl-6">
      <div className="absolute -left-[11px] top-1 bg-background rounded-full">
        {getStatusIcon()}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="font-semibold text-sm">{sourceLabel}</div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            <ClientDate date={event.receivedAt} format="PP pp" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getDisbursementStatusColor(status)}>{status}</Badge>
          <span className="text-xs text-muted-foreground">
            Provider: {event.provider || '-'}
          </span>
        </div>

        {event.payloadRaw && (
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
                  {JSON.stringify(event.payloadRaw, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DisbursementsEvents({ events }: DisbursementsEventsProps) {
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Disbursement Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
            No events found for this disbursement
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
            <EventItem key={`${event.id}-${event.receivedAt}`} event={event} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
