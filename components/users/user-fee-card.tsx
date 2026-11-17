'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Receipt, Edit3, ArrowUpRight, ArrowDownLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getUserVaProductFees, removeUserVaProductFee, getUserDisburseAcquirerFees, removeUserDisburseAcquirerFee } from '@/app/dashboard/users/actions'
import { UserVaProductFee, UserDisburseAcquirerFee } from '@/types/user.type'
import UserFeeEditModal from './user-fee-edit-modal'
import UserVaProductFeeModal from './user-va-product-fee-modal'
import UserDisburseAcquirerFeeModal from './user-disburse-acquirer-fee-modal'

interface UserFeeCardProps {
  userId: string
  feeDisburse?: string | number | null
  feeVa?: string | number | null
}

export default function UserFeeCard({
  userId,
  feeDisburse,
  feeVa,
}: UserFeeCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isProductFeeOpen, setIsProductFeeOpen] = useState(false)
  const [editingProductFee, setEditingProductFee] = useState<UserVaProductFee | null>(null)
  const [productFees, setProductFees] = useState<UserVaProductFee[]>([])
  const [isLoadingFees, setIsLoadingFees] = useState(true)
  const [feeError, setFeeError] = useState<string | null>(null)
  const [removingProductId, setRemovingProductId] = useState<string | null>(null)
  const [isDisburseFeeOpen, setIsDisburseFeeOpen] = useState(false)
  const [editingDisburseFee, setEditingDisburseFee] = useState<UserDisburseAcquirerFee | null>(null)
  const [disburseFees, setDisburseFees] = useState<UserDisburseAcquirerFee[]>([])
  const [isLoadingDisburseFees, setIsLoadingDisburseFees] = useState(true)
  const [disburseFeeError, setDisburseFeeError] = useState<string | null>(null)
  const [removingAcquirerId, setRemovingAcquirerId] = useState<string | null>(null)

  const loadProductFees = useCallback(async () => {
    const result = await getUserVaProductFees(userId)
    setProductFees(result.data)
    setFeeError(result.success ? null : result.message || 'Gagal memuat fee produk VA')
    setIsLoadingFees(false)
  }, [userId])

  useEffect(() => { void loadProductFees() }, [loadProductFees])

  const loadDisburseFees = useCallback(async () => {
    const result = await getUserDisburseAcquirerFees(userId)
    setDisburseFees(result.data)
    setDisburseFeeError(result.success ? null : result.message || 'Gagal memuat fee disbursement')
    setIsLoadingDisburseFees(false)
  }, [userId])

  useEffect(() => { void loadDisburseFees() }, [loadDisburseFees])

  const handleRemove = async (productFee: UserVaProductFee) => {
    if (!window.confirm(`Hapus fee khusus ${productFee.product_name} · ${productFee.provider}? Fee VA default akan berlaku kembali.`)) return
    setRemovingProductId(productFee.merchant_product_id)
    try {
      const result = await removeUserVaProductFee(userId, productFee.merchant_product_id)
      if (!result.success) {
        toast.error(result.message || 'Gagal menghapus fee produk VA')
        return
      }
      await loadProductFees()
      toast.success('Fee khusus dihapus; Fee VA default kembali berlaku')
    } finally {
      setRemovingProductId(null)
    }
  }

  const handleRemoveDisburseFee = async (fee: UserDisburseAcquirerFee) => {
    if (!window.confirm(`Hapus fee khusus ${fee.acquirer_name}? Fee Disburse default akan berlaku kembali.`)) return
    setRemovingAcquirerId(fee.disburse_acquirer_id)
    try {
      const result = await removeUserDisburseAcquirerFee(userId, fee.disburse_acquirer_id)
      if (!result.success) {
        toast.error(result.message || 'Gagal menghapus fee disbursement')
        return
      }
      await loadDisburseFees()
      toast.success('Fee khusus dihapus; Fee Disburse default kembali berlaku')
    } finally {
      setRemovingAcquirerId(null)
    }
  }

  const numFeeDisburse = Number(feeDisburse) || 0
  const numFeeVa = Number(feeVa) || 0

  return (
    <>
      <UserFeeEditModal
        userId={userId}
        initialFeeVa={numFeeVa}
        initialFeeDisburse={numFeeDisburse}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
      <UserVaProductFeeModal
        userId={userId}
        initialFee={editingProductFee}
        isOpen={isProductFeeOpen}
        onClose={() => setIsProductFeeOpen(false)}
        onSaved={loadProductFees}
      />

      <UserDisburseAcquirerFeeModal
        userId={userId}
        initialFee={editingDisburseFee}
        isOpen={isDisburseFeeOpen}
        onClose={() => setIsDisburseFeeOpen(false)}
        onSaved={loadDisburseFees}
      />

      <Card className="border-none shadow-xl bg-card overflow-hidden">
        <CardContent className="p-6 md:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Fee Configuration
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pengaturan biaya transaksi untuk user ini
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="h-9 px-4 text-xs font-bold border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Edit3 className="mr-2 h-3.5 w-3.5" />
              Edit Fee
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fee VA */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                    Fee VA Default
                  </span>
                  <span className="text-base font-extrabold text-foreground truncate mt-0.5">
                    Rp {numFeeVa.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1">Berlaku jika produk belum punya fee khusus</span>
                </div>
              </div>
            </div>

            {/* Fee Disburse */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-600 shrink-0">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                    Fee Disburse Default
                  </span>
                  <span className="text-base font-extrabold text-foreground truncate mt-0.5">
                    Rp {numFeeDisburse.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1">Berlaku jika acquirer belum punya fee khusus</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-foreground">Fee VA per Produk &amp; Provider</h4>
                <p className="text-xs text-muted-foreground">Fee tambahan merchant di atas fee dasar produk.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setEditingProductFee(null); setIsProductFeeOpen(true) }}
                className="self-start sm:self-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Fee Produk
              </Button>
            </div>

            {isLoadingFees ? (
              <p className="text-sm text-muted-foreground py-3">Memuat fee produk VA...</p>
            ) : feeError ? (
              <p className="text-sm text-destructive py-3">{feeError}</p>
            ) : productFees.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4">
                Belum ada fee khusus. Semua produk memakai Fee VA default.
              </p>
            ) : (
              <div className="space-y-2">
                {productFees.map((productFee) => (
                  <div key={productFee.merchant_product_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border/50 p-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{productFee.product_name}</span>
                        <Badge variant="outline">{productFee.provider}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">Kode: {productFee.product_code}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <span className="text-sm font-bold mr-auto sm:mr-2">
                        + Rp {Number(productFee.additional_fee).toLocaleString('id-ID')}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingProductFee(productFee); setIsProductFeeOpen(true) }}
                        aria-label={`Edit fee ${productFee.product_name} ${productFee.provider}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={removingProductId === productFee.merchant_product_id}
                        onClick={() => void handleRemove(productFee)}
                        aria-label={`Hapus fee ${productFee.product_name} ${productFee.provider}`}
                      >
                        {removingProductId === productFee.merchant_product_id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-foreground">Fee Disburse per Provider &amp; Metode</h4>
                <p className="text-xs text-muted-foreground">Fee tambahan merchant di atas fee dasar acquirer.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setEditingDisburseFee(null); setIsDisburseFeeOpen(true) }}
                className="self-start sm:self-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Fee Metode
              </Button>
            </div>

            {isLoadingDisburseFees ? (
              <p className="text-sm text-muted-foreground py-3">Memuat fee disbursement...</p>
            ) : disburseFeeError ? (
              <p className="text-sm text-destructive py-3">{disburseFeeError}</p>
            ) : disburseFees.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4">
                Belum ada fee khusus. Semua metode memakai Fee Disburse default.
              </p>
            ) : (
              <div className="space-y-2">
                {disburseFees.map((fee) => (
                  <div key={fee.disburse_acquirer_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border/50 p-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{fee.method}</span>
                        <Badge variant="outline">{fee.provider}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {fee.acquirer_name} · Fee dasar Rp {Number(fee.base_fee).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <span className="text-sm font-bold mr-auto sm:mr-2">
                        + Rp {Number(fee.additional_fee).toLocaleString('id-ID')}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingDisburseFee(fee); setIsDisburseFeeOpen(true) }}
                        aria-label={`Edit fee ${fee.acquirer_name}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={removingAcquirerId === fee.disburse_acquirer_id}
                        onClick={() => void handleRemoveDisburseFee(fee)}
                        aria-label={`Hapus fee ${fee.acquirer_name}`}
                      >
                        {removingAcquirerId === fee.disburse_acquirer_id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
