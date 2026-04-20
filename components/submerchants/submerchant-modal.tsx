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

interface SubmerchantModalProps {
  id: string | null
  mode: 'view' | 'edit' | null
  onClose: () => void
  initialData?: SubMerchant
}

export default function SubmerchantModal({ id, mode, onClose, initialData }: SubmerchantModalProps) {
  const [formData, setFormData] = useState<Partial<SubMerchant>>(initialData || {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || mode !== 'edit') return

    setIsSubmitting(true)
    const result = await updateSubMerchant(id, {
      sub_merchant_name: formData.sub_merchant_name,
      store_id: formData.store_id,
      // Add other fields as needed based on API requirements
    })
    setIsSubmitting(false)

    if (result.success) {
      onClose()
    } else {
      alert(result.message)
    }
  }

  const isOpen = !!mode && !!id

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Acquirer
              </label>
              <Input
                value={formData.acquirer?.name || ''}
                readOnly
                className="col-span-3 bg-muted"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                User
              </label>
              <Input
                value={formData.user?.name || 'N/A'}
                readOnly
                className="col-span-3 bg-muted"
              />
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
