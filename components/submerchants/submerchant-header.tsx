'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import BulkAssignModal from './bulk-assign-modal'

export default function SubmerchantHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sub-Merchants</h1>
        <p className="mt-1 text-muted-foreground">
          Manage merchant accounts and their acquirer relationship
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Bulk Assign
        </Button>
      </div>

      <BulkAssignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
