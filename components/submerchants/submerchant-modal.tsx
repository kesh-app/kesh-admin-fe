'use client'

import { useState, useEffect } from 'react'
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
import { SubMerchant } from '@/types/sub-merchant.type'
import { updateSubMerchant } from '@/app/dashboard/submerchants/actions'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/libs/api-client.lib'
import { AcquirerListResponse } from '@/types/acquirer.type'
import { Search, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/libs/utils'

interface SubmerchantModalProps {
  id: string | null
  mode: 'view' | 'edit' | null
  onClose: () => void
  initialData?: SubMerchant
}

export default function SubmerchantModal({ id, mode, onClose, initialData }: SubmerchantModalProps) {
  const [formData, setFormData] = useState<Partial<SubMerchant>>(initialData || {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Acquirer search state
  const [acquirerSearch, setAcquirerSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(acquirerSearch)
    }, 500)
    return () => clearTimeout(handler)
  }, [acquirerSearch])

  // Fetch acquirers with React Query
  const { data: acquirersData, isLoading: isLoadingAcquirers } = useQuery<AcquirerListResponse>({
    queryKey: ['acquirers', debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get<AcquirerListResponse>('/acquirers', {
        params: { search: debouncedSearch, limit: 10 }
      })
      return res.data
    },
    enabled: mode === 'edit' && !!id,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || mode !== 'edit') return

    setIsSubmitting(true)
    const result = await updateSubMerchant(id, {
      sub_merchant_name: formData.sub_merchant_name,
      store_id: formData.store_id,
      acquirer_id: formData.acquirer_id, // Use the selected acquirer_id
    })
    setIsSubmitting(false)

    if (result.success) {
      onClose()
    } else {
      alert(result.message)
    }
  }

  const isOpen = !!mode && !!id

  const handleSelectAcquirer = (acquirer: { id: string, name: string }) => {
    setFormData({ 
      ...formData, 
      acquirer_id: acquirer.id,
      acquirer: { ...formData.acquirer, id: acquirer.id, name: acquirer.name } as any
    })
    setIsDropdownOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === 'edit' ? 'Edit Sub-Merchant' : 'Sub-Merchant Details'}</DialogTitle>
            <DialogDescription>
              {mode === 'edit' 
                ? 'Update sub-merchant information here. Click save when you\'re done.' 
                : 'Detailed information about the sub-merchant.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={formData.sub_merchant_name || ''}
                readOnly={mode === 'view'}
                onChange={(e) => setFormData({ ...formData, sub_merchant_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sub_id" className="text-right text-sm font-medium">
                Merchant ID
              </label>
              <Input
                id="sub_id"
                value={formData.sub_merchant_id || ''}
                readOnly
                className="col-span-3 bg-muted"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="store_id" className="text-right text-sm font-medium">
                Store ID
              </label>
              <Input
                id="store_id"
                value={formData.store_id || ''}
                readOnly={mode === 'view'}
                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                className="col-span-3"
              />
            </div>

            {/* Acquirer Field */}
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium pt-2">
                Acquirer
              </label>
              <div className="col-span-3 relative">
                {mode === 'edit' ? (
                  <div className="space-y-2">
                    <div 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="truncate">
                        {formData.acquirer?.name || "Select Acquirer..."}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-background text-foreground rounded-md border shadow-md p-1 animate-in fade-in zoom-in-95">
                        <div className="flex items-center px-2 py-1 border-b">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <input
                            className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Type to search..."
                            value={acquirerSearch}
                            onChange={(e) => setAcquirerSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1">
                          {isLoadingAcquirers ? (
                            <div className="py-2 text-center text-sm text-muted-foreground">Loading...</div>
                          ) : acquirersData?.data?.length === 0 ? (
                            <div className="py-2 text-center text-sm text-muted-foreground">No acquirer found.</div>
                          ) : (
                            acquirersData?.data?.map((acquirer) => (
                              <div
                                key={acquirer.id}
                                className={cn(
                                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                  formData.acquirer_id === acquirer.id && "bg-accent"
                                )}
                                onClick={() => handleSelectAcquirer(acquirer)}
                              >
                                <span>{acquirer.name}</span>
                                {formData.acquirer_id === acquirer.id && (
                                  <Check className="ml-auto h-4 w-4" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    value={formData.acquirer?.name || ''}
                    readOnly
                    className="bg-muted"
                  />
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            {mode === 'edit' ? (
              <>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={onClose}>
                Close
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

