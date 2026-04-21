'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import KYBStatusModal from './kyb-status-modal'
import { KYBData } from '@/types/kyb.type'

interface KYBDetailActionsProps {
  data: KYBData
}

export default function KYBDetailActions({ data }: KYBDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button size="lg" onClick={() => setIsModalOpen(true)} className="shadow-lg hover:shadow-xl transition-all">
        Update Status
      </Button>
      
      <KYBStatusModal 
        data={data} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  )
}
