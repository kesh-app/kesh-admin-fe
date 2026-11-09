'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CreateIntrabankModal from './create-intrabank-modal'

export default function AddIntrabankTransferButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Buat Transaksi Intrabank
      </Button>
      <CreateIntrabankModal open={open} onOpenChange={setOpen} />
    </>
  )
}
