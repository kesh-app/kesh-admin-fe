'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { getMerchantProducts } from '@/app/dashboard/merchant-products/actions'
import { setUserVaProductFee } from '@/app/dashboard/users/actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PaginationMeta } from '@/types/api.type'
import { MerchantProduct } from '@/types/merchant-product.type'
import { UserVaProductFee } from '@/types/user.type'

interface UserVaProductFeeModalProps {
  userId: string
  isOpen: boolean
  initialFee: UserVaProductFee | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export default function UserVaProductFeeModal({
  userId,
  isOpen,
  initialFee,
  onClose,
  onSaved,
}: UserVaProductFeeModalProps) {
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [products, setProducts] = useState<MerchantProduct[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [productError, setProductError] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [fee, setFee] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!isOpen) return
    setSearch('')
    setAppliedSearch('')
    setPage(1)
    setSelectedProductId(initialFee?.merchant_product_id ?? '')
    setFee(initialFee ? String(initialFee.additional_fee) : '')
  }, [isOpen, initialFee])

  useEffect(() => {
    if (!isOpen || initialFee) return
    let cancelled = false
    setIsLoadingProducts(true)
    setProductError(null)
    getMerchantProducts({ page, limit: 10, search: appliedSearch || undefined, type: 'VA' })
      .then((result) => {
        if (cancelled) return
        setProducts(result.data)
        setMeta(result.meta)
        if (!result.success) setProductError(result.message || 'Gagal memuat produk VA')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProducts(false)
      })
    return () => { cancelled = true }
  }, [isOpen, initialFee, page, appliedSearch])

  const selectedProduct = products.find((product) => product.id === selectedProductId)
  const handleSearch = () => {
    setSelectedProductId('')
    setPage(1)
    setAppliedSearch(search.trim())
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedProductId) {
      toast.error('Pilih produk VA terlebih dahulu')
      return
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(fee.trim()) || !Number.isFinite(Number(fee))) {
      toast.error('Fee tambahan harus berupa angka minimal 0 dengan maksimal 2 desimal')
      return
    }

    startTransition(async () => {
      const result = await setUserVaProductFee(userId, selectedProductId, Number(fee))
      if (!result.success) {
        toast.error(result.message || 'Gagal menyimpan fee produk VA')
        return
      }
      toast.success('Fee produk VA berhasil disimpan')
      await onSaved()
      onClose()
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialFee ? 'Edit Fee Produk VA' : 'Tambah Fee Produk VA'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {initialFee ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-semibold">{initialFee.product_name} · {initialFee.provider}</p>
              <p className="text-xs text-muted-foreground">Kode: {initialFee.product_code}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <label htmlFor="va-product-search" className="text-sm font-semibold">Produk VA dan provider</label>
              <div className="flex gap-2">
                <Input
                  id="va-product-search"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setSelectedProductId('') }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleSearch()
                    }
                  }}
                  placeholder="Cari nama atau kode produk"
                />
                <Button type="button" variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Cari produk</span>
                </Button>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border divide-y">
                {isLoadingProducts ? (
                  <p className="p-4 text-sm text-muted-foreground">Memuat produk...</p>
                ) : productError ? (
                  <p className="p-4 text-sm text-destructive">{productError}</p>
                ) : products.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Produk VA tidak ditemukan.</p>
                ) : products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProductId(product.id)}
                    aria-pressed={selectedProductId === product.id}
                    className={`flex w-full items-center justify-between gap-3 p-3 text-left text-sm hover:bg-muted/50 ${selectedProductId === product.id ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold truncate">{product.product_name}</span>
                      <span className="block text-xs text-muted-foreground truncate">{product.code}</span>
                    </span>
                    <span className="shrink-0 text-xs font-medium">{product.provider}</span>
                  </button>
                ))}
              </div>
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Halaman {page} dari {meta.totalPages}</span>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" disabled={page <= 1} onClick={() => { setSelectedProductId(''); setPage(page - 1) }}>Sebelumnya</Button>
                    <Button type="button" size="sm" variant="outline" disabled={page >= meta.totalPages} onClick={() => { setSelectedProductId(''); setPage(page + 1) }}>Berikutnya</Button>
                  </div>
                </div>
              )}
              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  Dipilih: {selectedProduct.product_name} · {selectedProduct.provider} ({selectedProduct.code})
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="va-product-fee" className="text-sm font-semibold">Fee tambahan merchant (IDR)</label>
            <Input
              id="va-product-fee"
              type="number"
              min="0"
              step="0.01"
              value={fee}
              onChange={(event) => setFee(event.target.value)}
              placeholder="0"
              required
            />
            <p className="text-xs text-muted-foreground">
              Ditambahkan ke fee dasar produk. Isi 0 untuk tanpa tambahan fee.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Batal</Button>
            <Button type="submit" disabled={isPending || !selectedProductId}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Fee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
