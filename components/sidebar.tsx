'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  ShoppingCart,
  GitBranch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Acquirers', href: '/acquirers', icon: Building2 },
  { name: 'Submerchants', href: '/submerchants', icon: ShoppingCart },
  { name: 'Assignments', href: '/assignments', icon: GitBranch },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-40 md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 border-r border-border bg-card transition-transform duration-300 md:translate-x-0 z-40',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-bold">
              K
            </div>
            <span className="text-lg font-bold text-foreground">KESH</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold">KESH Admin v1.0</p>
              <p>© 2024 All rights reserved</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile (compensate for fixed menu button) */}
      <div className="h-12 md:hidden" />
    </>
  )
}
