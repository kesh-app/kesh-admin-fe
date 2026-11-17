'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { getAvailableDisburseAcquirers, setUserDisburseAcquirerFee } from '@/app/dashboard/users/actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PaginationMeta } from '@/types/api.type'
import { DisburseAcquirer } from '@/types/disburse-acquirer.type'
import { UserDisburseAcquirerFee } from '@/types/user.type'

interface UserDisburseAcquirerFeeModalProps {
  userId: string
  isOpen: boolean
  initialFee: UserDisburseAcquirerFee | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export default function UserDisburseAcquirerFeeModal({
  userId,
  isOpen,
  initialFee,
  onClose,
  onSaved,
}: UserDisburseAcquirerFeeModalProps) {
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [acquirers, setAcquirers] = useState<DisburseAcquirer[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoadingAcquirers, setIsLoadingAcquirers] = useState(false)
  const [acquirerError, setAcquirerError] = useState<string | null>(null)
  const [selectedAcquirerId, setSelectedAcquirerId] = useState('')
  const [fee, setFee] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!isOpen) return
    setSearch('')
    setAppliedSearch('')
    setPage(1)
    setSelectedAcquirerId(initialFee?.disburse_acquirer_id ?? '')
    setFee(initialFee ? String(initialFee.additional_fee) : '')
  }, [isOpen, initialFee])

  useEffect(() => {
    if (!isOpen || initialFee) return
    let cancelled = false
    setIsLoadingAcquirers(true)
    setAcquirerError(null)
    getAvailableDisburseAcquirers(page, appliedSearch)
      .then((result) => {
        if (cancelled) return
        setAcquirers(result.data)
        setMeta(result.meta)
        if (!result.success) setAcquirerError(result.message || 'Gagal memuat acquirer disbursement')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAcquirers(false)
      })
    return () => { cancelled = true }
  }, [isOpen, initialFee, page, appliedSearch])

  const selectedAcquirer = acquirers.find((acquirer) => acquirer.id === selectedAcquirerId)
  const handleSearch = () => {
    setSelectedAcquirerId('')
    setPage(1)
    setAppliedSearch(search.trim())
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedAcquirerId) {
      toast.error('Pilih acquirer disbursement terlebih dahulu')
      return
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(fee.trim()) || !Number.isFinite(Number(fee))) {
      toast.error('Fee tambahan harus berupa angka minimal 0 dengan maksimal 2 desimal')
      return
    }

    startTransition(async () => {
      const result = await setUserDisburseAcquirerFee(userId, selectedAcquirerId, Number(fee))
      if (!result.success) {
        toast.error(result.message || 'Gagal menyimpan fee disbursement')
        return
      }
      toast.success('Fee disbursement berhasil disimpan')
      await onSaved()
      onClose()
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialFee ? 'Edit Fee Metode Disburse' : 'Tambah Fee Metode Disburse'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {initialFee ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-semibold">{initialFee.provider} · {initialFee.method}</p>
              <p className="text-xs text-muted-foreground">
                {initialFee.acquirer_name} · Fee dasar Rp {Number(initialFee.base_fee).toLocaleString('id-ID')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label htmlFor="disburse-acquirer-search" className="text-sm font-semibold">Provider dan metode disbursement</label>
              <div className="flex gap-2">
                <Input
                  id="disburse-acquirer-search"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setSelectedAcquirerId('') }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleSearch()
                    }
                  }}
                  placeholder="Cari provider atau metode"
                />
                <Button type="button" variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Cari acquirer</span>
                </Button>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border divide-y">
                {isLoadingAcquirers ? (
                  <p className="p-4 text-sm text-muted-foreground">Memuat acquirer...</p>
                ) : acquirerError ? (
                  <p className="p-4 text-sm text-destructive">{acquirerError}</p>
                ) : acquirers.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Acquirer aktif tidak ditemukan.</p>
                ) : acquirers.map((acquirer) => (
                  <button
                    key={acquirer.id}
                    type="button"
                    onClick={() => setSelectedAcquirerId(acquirer.id)}
                    aria-pressed={selectedAcquirerId === acquirer.id}
                    className={`flex w-full items-center justify-between gap-3 p-3 text-left text-sm hover:bg-muted/50 ${selectedAcquirerId === acquirer.id ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold truncate">{acquirer.type} · {acquirer.name.split('_').slice(1).join('_')}</span>
                      <span className="block text-xs text-muted-foreground truncate">{acquirer.name}</span>
                    </span>
                    <span className="shrink-0 text-xs font-medium">Rp {Number(acquirer.fee_amount).toLocaleString('id-ID')}</span>
                  </button>
                ))}
              </div>
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Halaman {page} dari {meta.totalPages}</span>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" disabled={page <= 1} onClick={() => { setSelectedAcquirerId(''); setPage(page - 1) }}>Sebelumnya</Button>
                    <Button type="button" size="sm" variant="outline" disabled={page >= meta.totalPages} onClick={() => { setSelectedAcquirerId(''); setPage(page + 1) }}>Berikutnya</Button>
                  </div>
                </div>
              )}
              {selectedAcquirer && (
                <p className="text-xs text-muted-foreground">
                  Dipilih: {selectedAcquirer.name} · Fee dasar Rp {Number(selectedAcquirer.fee_amount).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="disburse-acquirer-fee" className="text-sm font-semibold">Fee tambahan merchant (IDR)</label>
            <Input
              id="disburse-acquirer-fee"
              type="number"
              min="0"
              step="0.01"
              value={fee}
              onChange={(event) => setFee(event.target.value)}
              placeholder="0"
              required
            />
            <p className="text-xs text-muted-foreground">
              Ditambahkan ke fee dasar acquirer. Isi 0 untuk tanpa tambahan fee.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Batal</Button>
            <Button type="submit" disabled={isPending || !selectedAcquirerId}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Fee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
