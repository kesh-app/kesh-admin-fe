import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { MainLayout } from '@/components/main-layout'
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
      <head>
        <Script
          id="hydration-fix"
          src="/scripts/hydration-fix.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <IndexProviders>
          <MainLayout>{children}</MainLayout>
        </IndexProviders>
      </body>
    </html>
  )
}
