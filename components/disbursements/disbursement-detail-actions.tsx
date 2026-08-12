'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Gavel, Send } from 'lucide-react'
import { CallbackDeliveryResult, Disbursement } from '@/types/disbursement.type'
import DisbursementFinalizeModal from './disbursement-finalize-modal'

interface DisbursementDetailActionsProps {
  disbursement: Disbursement
}

export default function DisbursementDetailActions({
  disbursement,
}: DisbursementDetailActionsProps) {
  const router = useRouter()

  const [modalOpen, setModalOpen] = useState(false)
  const [resendResult, setResendResult] = useState<CallbackDeliveryResult | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isPendingStatus = disbursement.status.toUpperCase() === 'PENDING'

  const handleResend = () => {
    setResendError(null)
    setResendResult(null)

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/disbursements/${disbursement.id}/resend-callback`,
          { method: 'POST' },
        )
        const result = await response.json()

        if (result.success) {
          setResendResult(result.data)
          router.refresh()
        } else {
          setResendError(result.message)
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
        {isPendingStatus ? (
          <>
            <p className="text-sm text-muted-foreground">
              BI-FAST and RTOL send no notification, so a pending transfer stays pending until
              it is settled here.
            </p>
            <Button className="w-full" onClick={() => setModalOpen(true)}>
              <Gavel className="h-4 w-4 mr-2" />
              Finalise Status
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              This disbursement is already final. You can resend the merchant callback if the
              earlier delivery failed.
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
          </>
        )}

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

        <DisbursementFinalizeModal
          disbursement={disbursement}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </CardContent>
    </Card>
  )
}
