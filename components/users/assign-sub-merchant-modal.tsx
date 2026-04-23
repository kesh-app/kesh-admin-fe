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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/libs/api-client.lib'
import { AcquirerListResponse } from '@/types/acquirer.type'
import { AssignSubMerchantRequest } from '@/types/sub-merchant.type'
import { SubMerchant } from '@/types/user.type'
import { Search, Check, ChevronsUpDown, Store, User as UserIcon, Building2, Tag, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/libs/utils'
import { toast } from 'sonner'

interface AssignSubMerchantModalProps {
  userId: string
  userName?: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialData?: SubMerchant | null
  initialAcquirerName?: string
}

export default function AssignSubMerchantModal({ 
  userId, 
  userName,
  isOpen, 
  onClose,
  onSuccess,
  initialData,
  initialAcquirerName,
}: AssignSubMerchantModalProps) {
  const [formData, setFormData] = useState<Partial<AssignSubMerchantRequest>>({
    user_id: userId,
    sub_merchant_id: '',
    store_id: '',
    sub_merchant_name: '',
    acquirer_id: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Acquirer selection state
  const [acquirerSearch, setAcquirerSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedAcquirerName, setSelectedAcquirerName] = useState('')

  // Visibility toggles
  const [showSubMerchantId, setShowSubMerchantId] = useState(false)
  const [showStoreId, setShowStoreId] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        user_id: userId,
        sub_merchant_id: initialData?.sub_merchant_id || '',
        store_id: initialData?.store_id || '',
        sub_merchant_name: initialData?.sub_merchant_name || '',
        acquirer_id: initialData?.acquirer_id || '',
      })
      setSelectedAcquirerName(initialAcquirerName || '')
      setAcquirerSearch('')
    }
  }, [isOpen, userId, initialData, initialAcquirerName])

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(acquirerSearch)
    }, 500)
    return () => clearTimeout(handler)
  }, [acquirerSearch])

  // Fetch acquirers
  const { data: acquirersData, isLoading: isLoadingAcquirers } = useQuery<AcquirerListResponse>({
    queryKey: ['acquirers-selection', debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get<AcquirerListResponse>('/acquirers', {
        params: { search: debouncedSearch, limit: 20, is_status: true }
      })
      return res.data
    },
    enabled: isOpen,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sub_merchant_id || !formData.store_id || !formData.sub_merchant_name || !formData.acquirer_id) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiClient.post('/sub-merchants/assign', formData)
      
      if (response.data.success) {
        toast.success('Sub-merchant assigned successfully')
        onSuccess?.()
        onClose()
      } else {
        toast.error(response.data.message || 'Failed to assign sub-merchant')
      }
    } catch (error: any) {
      console.error('Assignment error:', error)
      toast.error(error.response?.data?.message || 'An error occurred during assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectAcquirer = (acquirer: { id: string, name: string }) => {
    setFormData(prev => ({ ...prev, acquirer_id: acquirer.id }))
    setSelectedAcquirerName(acquirer.name)
    setIsDropdownOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="bg-primary/5 p-6 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Store className="h-6 w-6 text-primary" />
                Assign Sub-Merchant
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Link a sub-merchant credential to {userName ? <span className="font-semibold text-foreground">{userName}</span> : 'this user'}.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* User ID (Hidden/Read-only) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User Target</label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{userName || 'User'}</span>
                  <span className="text-xs font-mono text-muted-foreground mt-1">{userId}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Sub Merchant ID */}
              <div className="space-y-2">
                <label htmlFor="sub_merchant_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Sub-Merchant ID
                </label>
                <div className="relative">
                  <Input
                    id="sub_merchant_id"
                    type={showSubMerchantId ? 'text' : 'password'}
                    placeholder="e.g. SUB-123"
                    value={formData.sub_merchant_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, sub_merchant_id: e.target.value }))}
                    className="bg-background border-border focus:ring-primary/20 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSubMerchantId(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showSubMerchantId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Store ID */}
              <div className="space-y-2">
                <label htmlFor="store_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Store className="h-3 w-3" /> Store ID
                </label>
                <div className="relative">
                  <Input
                    id="store_id"
                    type={showStoreId ? 'text' : 'password'}
                    placeholder="e.g. STORE-123"
                    value={formData.store_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, store_id: e.target.value }))}
                    className="bg-background border-border focus:ring-primary/20 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStoreId(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showStoreId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Sub Merchant Name */}
            <div className="space-y-2">
              <label htmlFor="sub_merchant_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sub-Merchant Name</label>
              <Input
                id="sub_merchant_name"
                placeholder="e.g. Toko Sembako Jaya"
                value={formData.sub_merchant_name}
                onChange={(e) => setFormData(prev => ({ ...prev, sub_merchant_name: e.target.value }))}
                className="bg-background border-border focus:ring-primary/20"
                required
              />
            </div>

            {/* Acquirer Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Acquirer
              </label>
              <div className="relative">
                <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <PopoverTrigger asChild>
                    <div 
                      className={cn(
                        "flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer transition-all hover:border-primary/50",
                        isDropdownOpen && "border-primary ring-2 ring-primary/10"
                      )}
                    >
                      <span className={cn("truncate font-medium", !selectedAcquirerName && "text-muted-foreground font-normal")}>
                        {selectedAcquirerName || "Select an acquirer..."}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 w-[450px]" align="start" side="top">
                    <div className="flex items-center px-3 py-2 border-b border-border mb-2">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-40" />
                      <input
                        className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Search acquirers..."
                        value={acquirerSearch}
                        onChange={(e) => setAcquirerSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-[220px] overflow-y-auto scrollbar-hide">
                      {isLoadingAcquirers ? (
                        <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          Loading acquirers...
                        </div>
                      ) : acquirersData?.data?.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          No acquirers found.
                        </div>
                      ) : (
                        <div className="grid gap-1">
                          {acquirersData?.data?.map((acquirer) => (
                            <div
                              key={acquirer.id}
                              className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors",
                                formData.acquirer_id === acquirer.id 
                                  ? "bg-primary text-primary-foreground" 
                                  : "hover:bg-primary/10 hover:text-primary"
                              )}
                              onClick={() => handleSelectAcquirer(acquirer)}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold">{acquirer.name}</span>
                                <span className={cn("text-[10px] opacity-70", formData.acquirer_id === acquirer.id ? "text-primary-foreground" : "text-muted-foreground")}>
                                  ID: {acquirer.id.slice(0, 12)}...
                                </span>
                              </div>
                              {formData.acquirer_id === acquirer.id && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-6 border-t border-border">
            <DialogFooter className="gap-3 sm:gap-0">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.acquirer_id}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Assigning...
                  </div>
                ) : 'Assign Sub-Merchant'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
