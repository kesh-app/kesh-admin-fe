'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DisburseAcquirerForm from './disburse-acquirer-form'

export default function AddDisburseAcquirerButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Disburse Acquirer
      </Button>
      <DisburseAcquirerForm open={open} onOpenChange={setOpen} />
    </>
  )
}
