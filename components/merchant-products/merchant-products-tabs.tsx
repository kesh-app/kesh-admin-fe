'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MerchantProductsTabs({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    // Reset pagination when switching tabs
    params.delete('page')
    params.delete('groupPage')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:inline-flex">
        <TabsTrigger value="products">Merchant Products</TabsTrigger>
        <TabsTrigger value="groups">Product Groups</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
