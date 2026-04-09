'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token')
    
    // Allow auth pages without authentication
    if (pathname?.startsWith('/auth')) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    if (token) {
      setIsAuthenticated(true)
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login')
    }
    setIsLoading(false)
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl animate-pulse">
            K
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth pages without sidebar/header
  if (pathname?.startsWith('/auth')) {
    return children
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <Header />
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
