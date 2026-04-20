import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import IndexProviders from '@/providers/Index.provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KESH Admin Dashboard',
  description: 'Admin dashboard for KESH fintech platform',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <IndexProviders>
          {children}
        </IndexProviders>
      </body>
    </html>
  )
}
