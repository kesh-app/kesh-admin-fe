import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary to-primary/90">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
