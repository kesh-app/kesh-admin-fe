'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AcquirerForm from './acquirer-form'

export default function AddAcquirerButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Acquirer
      </Button>
      <AcquirerForm open={open} onOpenChange={setOpen} />
    </>
  )
}
