'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Send } from 'lucide-react'
import { QrisTransaction } from '@/types/qris.type'
import { CallbackDeliveryResult } from '@/types/disbursement.type'

interface QrisDetailActionsProps {
  transaction: QrisTransaction
}

export default function QrisDetailActions({ transaction }: QrisDetailActionsProps) {
  const router = useRouter()

  const [resendResult, setResendResult] = useState<CallbackDeliveryResult | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleResend = () => {
    setResendError(null)
    setResendResult(null)

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/qris/${transaction.id}/resend-callback`,
          { method: 'POST' },
        )
        const result = await response.json()

        if (result.success) {
          setResendResult(result.data)
          router.refresh()
        } else {
          setResendError(
            result.message ||
            (result.error ? String(result.error) : null) ||
            `Request failed (HTTP ${response.status})`
          )
        }
      } catch (err: any) {
        setResendError(err.message || 'An unexpected error occurred')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          You can resend the merchant callback if the earlier delivery failed.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={isPending}
        >
          <Send className="h-4 w-4 mr-2" />
          {isPending ? 'Sending...' : 'Resend Callback'}
        </Button>

        {resendResult && (
          <div
            className={
              resendResult.outcome === 'DELIVERED'
                ? 'flex items-center gap-2 rounded-md bg-green-100 p-3 text-sm text-green-700'
                : 'flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive'
            }
          >
            {resendResult.outcome === 'DELIVERED' ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Delivered (HTTP {resendResult.httpStatus}).</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Failed: {resendResult.failureCategory}
                  {resendResult.errorMessage ? ` — ${resendResult.errorMessage}` : ''}
                </span>
              </>
            )}
          </div>
        )}

        {resendError && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{resendError}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
