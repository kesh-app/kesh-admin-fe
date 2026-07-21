'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VaAcquirerForm from './va-acquirer-form'

export default function AddVaAcquirerButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        <span>Add New</span>
      </Button>

      <VaAcquirerForm open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
