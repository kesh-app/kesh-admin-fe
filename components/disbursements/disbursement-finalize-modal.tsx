'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { CallbackDeliveryResult, Disbursement } from '@/types/disbursement.type'

interface DisbursementFinalizeModalProps {
  disbursement: Disbursement
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DisbursementFinalizeModal({
  disbursement,
  open,
  onOpenChange,
}: DisbursementFinalizeModalProps) {
  const router = useRouter()

  const [status, setStatus] = useState<'SUCCESS' | 'FAILED'>('SUCCESS')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [callback, setCallback] = useState<CallbackDeliveryResult | null>(null)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  const amount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: disbursement.currency?.trim() || 'IDR',
  }).format(parseFloat(disbursement.amountValue))

  const handleClose = (next: boolean) => {
    if (!next && done) {
      // The row changed on the server — pull the fresh copy in before closing.
      router.refresh()
    }
    if (!next) {
      setDone(false)
      setCallback(null)
      setError(null)
      setReason('')
      setStatus('SUCCESS')
    }
    onOpenChange(next)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (status === 'FAILED' && !reason.trim()) {
      setError('Reason is required when marking a disbursement as failed.')
      return
    }

    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/disbursements/${disbursement.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, reason: reason.trim() || undefined }),
        })

        const result = await response.json()

        if (result.success) {
          setCallback(result.data?.callback ?? null)
          setDone(true)
        } else {
          setError(result.message)
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        {done ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Disbursement marked as {status}
              </DialogTitle>
              <DialogDescription>{disbursement.partnerRefNo}</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {callback ? (
                callback.outcome === 'DELIVERED' ? (
                  <div className="rounded-md bg-green-100 p-3 text-sm text-green-700">
                    Callback delivered to the merchant (HTTP {callback.httpStatus}, attempt{' '}
                    {callback.totalAttempts}).
                  </div>
                ) : (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <p className="font-medium">Callback delivery failed.</p>
                    <p className="mt-1">
                      {callback.failureCategory}
                      {callback.errorMessage ? ` — ${callback.errorMessage}` : ''} after{' '}
                      {callback.totalAttempts} attempt(s). The status change still stands; use
                      Resend Callback once the merchant endpoint is reachable.
                    </p>
                  </div>
                )
              ) : (
                <div className="rounded-md bg-yellow-100 p-3 text-sm text-yellow-700">
                  No callback URL is configured for this merchant, so nothing was sent.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => handleClose(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Finalise Disbursement</DialogTitle>
              <DialogDescription>
                Set the final status for {disbursement.partnerRefNo} ({amount}).
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Final Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'SUCCESS' | 'FAILED')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              {/* Ops must see what the button actually does to the merchant's money. */}
              <div className="flex gap-2 rounded-md bg-muted/50 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />
                <div className="space-y-1 text-muted-foreground">
                  {status === 'SUCCESS' ? (
                    <>
                      <p>
                        The merchant balance will be debited{' '}
                        <span className="font-medium text-foreground">{amount}</span>, the
                        acquirer fee will be charged on top, and the fee will be swept to the
                        holding account.
                      </p>
                      <p>Neither was charged while the transfer was pending.</p>
                    </>
                  ) : (
                    <p>No money moves. The transfer is recorded as failed and nothing is charged.</p>
                  )}
                  <p className="font-medium text-foreground">
                    This is final — only a PENDING disbursement can be finalised, and it cannot
                    be undone.
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Reason{' '}
                  {status === 'FAILED' ? (
                    <span className="text-destructive">*</span>
                  ) : (
                    <span className="text-muted-foreground">(optional)</span>
                  )}
                </label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="e.g. Confirmed settled on the NOBU statement"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={
                    error && status === 'FAILED' && !reason
                      ? 'border-destructive transition-all'
                      : 'transition-all'
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Stored on the audit event and sent to the merchant in the callback.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm rounded-md bg-destructive/10 text-destructive animate-in fade-in duration-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Finalising...' : `Mark as ${status}`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
