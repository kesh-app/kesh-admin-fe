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
import { VATransaction } from '@/types/va-transaction.type'
import { CallbackDeliveryResult } from '@/types/disbursement.type'

interface VATransactionFinalizeModalProps {
  transaction: VATransaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VATransactionFinalizeModal({
  transaction,
  open,
  onOpenChange,
}: VATransactionFinalizeModalProps) {
  const router = useRouter()

  const [status, setStatus] = useState<'SUCCESS' | 'FAILED'>('SUCCESS')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [callback, setCallback] = useState<CallbackDeliveryResult | null>(null)
  const [refunded, setRefunded] = useState(false)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  const currency = transaction.currency?.trim() || 'IDR'
  const money = (value: string) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(parseFloat(value))

  const refundTotal = (
    parseFloat(transaction.total_amount || '0') + parseFloat(transaction.fee_amount || '0')
  ).toFixed(2)

  // The API refuses a refund it cannot route to a product balance — warn before the attempt.
  const refundBlocked = !transaction.product_code

  const handleClose = (next: boolean) => {
    if (!next && done) {
      router.refresh()
    }
    if (!next) {
      setDone(false)
      setCallback(null)
      setRefunded(false)
      setError(null)
      setReason('')
      setStatus('SUCCESS')
    }
    onOpenChange(next)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (status === 'FAILED' && !reason.trim()) {
      setError('Reason is required when marking a transaction as failed.')
      return
    }

    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/va-transactions/${transaction.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, reason: reason.trim() || undefined }),
        })

        const result = await response.json()

        if (result.success) {
          setCallback(result.data?.callback ?? null)
          setRefunded(Boolean(result.data?.refunded))
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
                Transaction marked as {status}
              </DialogTitle>
              <DialogDescription>{transaction.payment_request_id}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {refunded && (
                <div className="rounded-md bg-green-100 p-3 text-sm text-green-700">
                  {money(refundTotal)} refunded to the merchant VA balance.
                </div>
              )}

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
              <DialogTitle>Finalise VA Bill Payment</DialogTitle>
              <DialogDescription>
                Set the final status for {transaction.payment_request_id} (
                {money(transaction.total_amount)}).
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
                    <p>
                      No money moves — the VA balance was already debited when the payment was
                      dispatched.
                    </p>
                  ) : (
                    <p>
                      <span className="font-medium text-foreground">{money(refundTotal)}</span>{' '}
                      will be refunded to the {transaction.product_code || 'product'} VA balance
                      — {money(transaction.total_amount)} principal plus{' '}
                      {money(transaction.fee_amount || '0')} fee.
                    </p>
                  )}
                  <p className="font-medium text-foreground">
                    This is final — only a PENDING transaction can be finalised, and it cannot
                    be undone.
                  </p>
                </div>
              </div>

              {status === 'FAILED' && refundBlocked && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    This transaction has no product code, so the API cannot tell which VA balance
                    to refund and will reject the request. Mark it as Success or fix the product
                    mapping first.
                  </span>
                </div>
              )}

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
