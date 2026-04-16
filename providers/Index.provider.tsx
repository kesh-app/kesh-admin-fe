"use client";

import {
  QueryClient,
  QueryClientProvider,
  environmentManager,
} from '@tanstack/react-query'
import NextAuthProvider from './NextAuth.provider'
import { Toaster } from 'sonner'
import SessionWatcher from '@/components/auth/SessionWatcher'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient()
  } else {
    // suspends during hydration, or on client-side navigations.
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function IndexProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <NextAuthProvider>
        <SessionWatcher />
        {children}
        <Toaster position="top-center" richColors />
      </NextAuthProvider>
    </QueryClientProvider>
  )
}