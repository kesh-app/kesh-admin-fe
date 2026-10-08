'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GlobalSettingLoadMoreProps {
  currentLimit: number
  total: number
}

export default function GlobalSettingLoadMore({ currentLimit, total }: GlobalSettingLoadMoreProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', (currentLimit + 30).toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const showing = Math.min(currentLimit, total)

  return (
    <div className="flex flex-col items-center gap-2 pt-4">
      <p className="text-xs text-muted-foreground">
        Showing {showing} of {total} settings
      </p>
      <Button variant="outline" onClick={handleLoadMore}>
        <ChevronDown className="h-4 w-4 mr-2" />
        Show More
      </Button>
    </div>
  )
}
