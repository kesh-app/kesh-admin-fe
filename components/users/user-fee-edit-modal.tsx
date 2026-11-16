'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Receipt, Loader2 } from 'lucide-react'
import { updateUserFee } from '@/app/dashboard/users/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UserFeeEditModalProps {
  userId: string
  initialFeeVa?: number | string | null
  initialFeeDisburse?: number | string | null
  isOpen: boolean
  onClose: () => void
}

export default function UserFeeEditModal({
  userId,
  initialFeeVa,
  initialFeeDisburse,
  isOpen,
  onClose,
}: UserFeeEditModalProps) {
  const [feeVa, setFeeVa] = useState<string>(
    initialFeeVa !== undefined && initialFeeVa !== null ? String(Number(initialFeeVa)) : '0'
  )
  const [feeDisburse, setFeeDisburse] = useState<string>(
    initialFeeDisburse !== undefined && initialFeeDisburse !== null ? String(Number(initialFeeDisburse)) : '0'
  )
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return
    setFeeVa(String(Number(initialFeeVa) || 0))
    setFeeDisburse(String(Number(initialFeeDisburse) || 0))
  }, [isOpen, initialFeeVa, initialFeeDisburse])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsedFeeVa = Number(feeVa)
    const parsedFeeDisburse = Number(feeDisburse)

    if (isNaN(parsedFeeVa) || parsedFeeVa < 0) {
      toast.error('Fee VA harus berupa angka valid dan minimal 0')
      return
    }

    if (isNaN(parsedFeeDisburse) || parsedFeeDisburse < 0) {
      toast.error('Fee Disburse harus berupa angka valid dan minimal 0')
      return
    }

    startTransition(async () => {
      const res = await updateUserFee(userId, {
        fee_va: parsedFeeVa,
        fee_disburse: parsedFeeDisburse,
      })

      if (res.success) {
        toast.success(res.message || 'Fee berhasil diperbarui')
        router.refresh()
        onClose()
      } else {
        toast.error(res.message || 'Gagal memperbarui fee')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Edit Fee Configuration</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fee VA Default (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={feeVa}
                onChange={(e) => setFeeVa(e.target.value)}
                placeholder="2500"
                className="pl-9 font-semibold"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Berlaku untuk produk VA yang belum memiliki fee tambahan khusus.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fee Disburse (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={feeDisburse}
                onChange={(e) => setFeeDisburse(e.target.value)}
                placeholder="1500"
                className="pl-9 font-semibold"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Biaya per transaksi pengiriman dana (Disbursement).
            </p>
          </div>

          <DialogFooter className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="font-semibold">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
