'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Wallet, Loader2 } from 'lucide-react'
import { updateUserBalance } from '@/app/dashboard/users/actions'
import { UpdateBalancePayload } from '@/types/user.type'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UserUpdateBalanceModalProps {
  userId: string
  currentBalance: number
  isOpen: boolean
  onClose: () => void
}

export default function UserUpdateBalanceModal({
  userId,
  currentBalance,
  isOpen,
  onClose,
}: UserUpdateBalanceModalProps) {
  const [fundType, setFundType] = useState<'DEBIT' | 'CREDIT'>('CREDIT')
  const [amount, setAmount] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const amountNumber = parseFloat(amount) || 0

  const handleClose = () => {
    setFundType('CREDIT')
    setAmount('')
    setReason('')
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || amountNumber <= 0) {
      toast.error('Jumlah amount harus lebih dari 0')
      return
    }

    if (fundType === 'DEBIT' && amountNumber > currentBalance) {
      toast.error('Balance tidak mencukupi untuk pengurangan (mines tidak diperbolehkan)')
      return
    }

    startTransition(async () => {
      const payload: UpdateBalancePayload = {
        fund_type: fundType,
        amount: amountNumber,
        reason: reason.trim() || undefined,
      }

      const result = await updateUserBalance(userId, payload)
      
      if (result.success) {
        toast.success(result.message)
        router.refresh()
        handleClose()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Update Balance
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Current Balance Display */}
          <div className="bg-primary/5 p-4 rounded-xl flex items-center justify-between border border-primary/10">
            <span className="text-sm font-semibold text-muted-foreground">Current Balance</span>
            <span className="text-lg font-black text-primary">
              Rp {currentBalance.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Tipe Penyesuaian</label>
              <select
                value={fundType}
                onChange={(e) => setFundType(e.target.value as 'DEBIT' | 'CREDIT')}
                className="w-full h-10 px-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={isPending}
              >
                <option value="CREDIT">CREDIT (Penambahan Balance)</option>
                <option value="DEBIT">DEBIT (Pengurangan Balance)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Note:</span> CREDIT akan menambah balance user. DEBIT akan mengurangi balance user.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Misal: 200000"
                min="1"
                className="w-full h-10 px-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">Alasan (Reason)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Koreksi manual: pengembalian dana..."
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Submit Update'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
