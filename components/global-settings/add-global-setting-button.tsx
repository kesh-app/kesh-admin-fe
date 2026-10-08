'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GlobalSettingForm from './global-setting-form'

interface AddGlobalSettingButtonProps {
  existingTypes: string[]
}

export default function AddGlobalSettingButton({ existingTypes }: AddGlobalSettingButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Setting
      </Button>
      <GlobalSettingForm open={open} onOpenChange={setOpen} existingTypes={existingTypes} />
    </>
  )
}
