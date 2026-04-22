'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrisTransactionEvent } from '@/types/qris.type'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Code2 } from 'lucide-react'

interface QrisEventsProps {
  events: QrisTransactionEvent[]
}

export default function QrisEvents({ events }: QrisEventsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No history events recorded.
              </p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="relative pl-6 border-l border-muted pb-4">
                  {/* Timeline dot */}
                  <div className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {format(new Date(event.receivedAt), 'HH:mm:ss')}
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">
                        {event.source}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(event.receivedAt), 'MMM dd, yyyy')}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-muted-foreground">Provider</p>
                        <p className="font-semibold">{event.provider}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-semibold">{event.transactionStatus}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sub Merchant</p>
                        <p className="font-semibold">{event.subMerchantId || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid Time</p>
                        <p className="font-semibold">{event.paidTime ? format(new Date(event.paidTime), 'HH:mm:ss') : '-'}</p>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] w-full mt-1">
                          <Code2 className="h-3 w-3 mr-1" />
                          View Raw Payload
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Raw Payload Data</DialogTitle>
                          <DialogDescription>
                            Full JSON data for transaction event {event.id}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[400px] mt-4">
                          <div className="bg-muted p-4 rounded-md">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                              {JSON.stringify(event.payloadRaw, null, 2)}
                            </pre>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
