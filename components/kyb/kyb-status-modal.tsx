'use client'

import React, { useState, useTransition } from 'react'
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
import { KYBData } from '@/types/kyb.type'
import { AlertCircle } from 'lucide-react'

interface KYBStatusModalProps {
  data: KYBData
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function KYBStatusModal({ data, open, onOpenChange }: KYBStatusModalProps) {
  const [status, setStatus] = useState<'approved' | 'rejected'>(data.status === 'approved' ? 'approved' : 'rejected')
  const [reason, setReason] = useState(data.reason || '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'rejected' && !reason.trim()) {
      setError('Reason is required when rejecting.')
      return
    }

    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        // Calling the dedicated Route Handler instead of a Server Action
        const response = await fetch(`/api/kyb/${data.id}/status`, {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          onOpenChange(false)
          // We might want to force a refresh if the server doesn't revalidate properly 
          // (though revalidatePath is used in the Route Handler)
          window.location.reload() // Force a full server-side refresh to be sure
        } else {
          setError(result.message)
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleAction}>
          <DialogHeader>
            <DialogTitle>Update KYB Status</DialogTitle>
            <DialogDescription>
              Change the verification status for {data.company_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {status === 'rejected' && (
              <div className="grid gap-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Reason for Rejection <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Enter rejection reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={error && status === 'rejected' && !reason ? "border-destructive transition-all" : "transition-all"}
                  required={status === 'rejected'}
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-md bg-destructive/10 text-destructive animate-in fade-in duration-300">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
