'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Search, ChevronsUpDown, Check, Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/libs/api-client.lib'
import { DisburseAcquirer, DisburseAcquirerListResponse } from '@/types/disburse-acquirer.type'
import { createIntrabankTransfer } from '@/app/dashboard/history-disburse-intrabank/actions'
import { cn } from '@/libs/utils'

const intrabankSchema = z.object({
  acquirer_name: z.string().min(1, 'Disburse acquirer harus dipilih'),
  sourceAccountNo: z.string().min(1, 'Source account no harus diisi'),
  amount: z
    .string()
    .min(1, 'Amount harus diisi')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount harus berupa angka positif',
    }),
  beneficiaryAccountNo: z.string().min(1, 'Beneficiary account no harus diisi'),
})

type IntrabankFormValues = z.infer<typeof intrabankSchema>

interface CreateIntrabankModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateIntrabankModal({
  open,
  onOpenChange,
}: CreateIntrabankModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [acquirers, setAcquirers] = useState<DisburseAcquirer[]>([])
  const [isFetchingAcquirers, setIsFetchingAcquirers] = useState(false)
  const [acquirerSearch, setAcquirerSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const form = useForm<IntrabankFormValues>({
    resolver: zodResolver(intrabankSchema),
    defaultValues: {
      acquirer_name: '',
      sourceAccountNo: '',
      amount: '',
      beneficiaryAccountNo: '',
    },
  })

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch disburse acquirers when dialog opens or search changes
  useEffect(() => {
    if (!open) {
      form.reset()
      setAcquirerSearch('')
      setIsDropdownOpen(false)
      return
    }

    let isMounted = true
    const timer = setTimeout(async () => {
      setIsFetchingAcquirers(true)
      try {
        const response = await apiClient.get<DisburseAcquirerListResponse>('/disburse-acquirers', {
          params: {
            search: acquirerSearch || undefined,
            limit: 50,
          },
        })
        if (isMounted) {
          setAcquirers(response.data?.data || [])
        }
      } catch (err) {
        console.error('Failed to load disburse acquirers:', err)
      } finally {
        if (isMounted) {
          setIsFetchingAcquirers(false)
        }
      }
    }, 300)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [open, acquirerSearch, form])

  const handleSelectAcquirer = (acquirer: DisburseAcquirer) => {
    form.setValue('acquirer_name', acquirer.name, { shouldValidate: true })

    // Auto-fill sourceAccountNo if exists in acquirer data, user can still edit it
    if (acquirer.source_account_no) {
      form.setValue('sourceAccountNo', acquirer.source_account_no, { shouldValidate: true })
    }

    setIsDropdownOpen(false)
  }

  const onSubmit = async (values: IntrabankFormValues) => {
    setIsLoading(true)
    try {
      const result = await createIntrabankTransfer({
        acquirer_name: values.acquirer_name,
        sourceAccountNo: values.sourceAccountNo,
        amount: values.amount,
        beneficiaryAccountNo: values.beneficiaryAccountNo,
      })

      if (result.success) {
        toast.success(result.message || 'Transaksi intrabank berhasil dibuat')
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.message)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Terjadi kesalahan saat membuat transaksi')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAcquirerName = form.watch('acquirer_name')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Buat Transaksi Intrabank</DialogTitle>
          <DialogDescription>
            Masukkan detail transaksi transfer intrabank.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2" autoComplete="off">
          {/* Select Disburse Acquirer */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Disburse Acquirer</label>
            <div className="relative" ref={dropdownRef}>
              <div
                className={cn(
                  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer',
                  form.formState.errors.acquirer_name && 'border-destructive'
                )}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={cn('truncate', !selectedAcquirerName && 'text-muted-foreground')}>
                  {selectedAcquirerName || 'Pilih Disburse Acquirer...'}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-background text-foreground rounded-md border shadow-md p-1 animate-in fade-in zoom-in-95">
                  <div className="flex items-center px-2 py-1 border-b">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-8 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Cari acquirer..."
                      value={acquirerSearch}
                      onChange={(e) => setAcquirerSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto p-1">
                    {isFetchingAcquirers ? (
                      <div className="flex items-center justify-center py-3 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memuat data...
                      </div>
                    ) : acquirers.length === 0 ? (
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        Tidak ada acquirer ditemukan.
                      </div>
                    ) : (
                      acquirers.map((acquirer) => (
                        <div
                          key={acquirer.id}
                          className={cn(
                            'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                            selectedAcquirerName === acquirer.name && 'bg-accent'
                          )}
                          onClick={() => handleSelectAcquirer(acquirer)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{acquirer.name}</span>
                            {acquirer.source_account_no && (
                              <span className="text-xs text-muted-foreground">
                                Rek: {acquirer.source_account_no}
                              </span>
                            )}
                          </div>
                          {selectedAcquirerName === acquirer.name && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {form.formState.errors.acquirer_name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.acquirer_name.message}
              </p>
            )}
          </div>

          {/* Source Account No */}
          <div className="space-y-2">
            <label htmlFor="sourceAccountNo" className="text-sm font-medium">
              Source Account No
            </label>
            <Input
              id="sourceAccountNo"
              placeholder="Masukkan nomor rekening pengirim"
              {...form.register('sourceAccountNo')}
              className={form.formState.errors.sourceAccountNo ? 'border-destructive' : ''}
            />
            {form.formState.errors.sourceAccountNo && (
              <p className="text-xs text-destructive">
                {form.formState.errors.sourceAccountNo.message}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              type="text"
              placeholder="e.g. 250000"
              {...form.register('amount')}
              className={form.formState.errors.amount ? 'border-destructive' : ''}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Beneficiary Account No */}
          <div className="space-y-2">
            <label htmlFor="beneficiaryAccountNo" className="text-sm font-medium">
              Beneficiary Account No
            </label>
            <Input
              id="beneficiaryAccountNo"
              placeholder="Masukkan nomor rekening penerima"
              {...form.register('beneficiaryAccountNo')}
              className={form.formState.errors.beneficiaryAccountNo ? 'border-destructive' : ''}
            />
            {form.formState.errors.beneficiaryAccountNo && (
              <p className="text-xs text-destructive">
                {form.formState.errors.beneficiaryAccountNo.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                'Kirim'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
