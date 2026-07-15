'use client'

import { useState, useEffect } from 'react'
import { format as formatFn } from 'date-fns'

interface ClientDateProps {
  date: string | Date | number | null | undefined
  format?: string
  fallback?: string
  className?: string
}

export function ClientDate({ date, format = 'dd MMM yyyy', fallback = '-', className }: ClientDateProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <span className={className}>{fallback}</span>
  }

  if (!date) {
    return <span className={className}>{fallback}</span>
  }

  try {
    return <span className={className}>{formatFn(new Date(date), format)}</span>
  } catch (error) {
    return <span className={className}>{fallback}</span>
  }
}
