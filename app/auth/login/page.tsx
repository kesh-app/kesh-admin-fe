'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCsrfToken } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  // Handle errors from redirect
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      if (error === 'CredentialsSignin') {
        toast.error('Gagal masuk. Mohon periksa kembali email dan password Anda.')
      } else {
        toast.error('Terjadi kesalahan saat masuk. Silakan coba lagi.')
      }
      // Clean up the URL
      router.replace('/auth/login')
    }

    // Fetch CSRF token for standard form submission
    const fetchToken = async () => {
      const token = await getCsrfToken()
      setCsrfToken(token ?? null)
    }
    fetchToken()
  }, [searchParams, router])

  const handleSubmit = () => {
    setIsLoading(true)
    // The form action will take over from here
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="https://res.cloudinary.com/doy2qixs5/image/upload/v1771388340/kesh/kesh-logo-square_cwtlqj.jpg"
            alt="KESH Logo"
            width={48}
            height={48}
            className="rounded-full"/>
        </div>
        <CardTitle className="text-2xl text-center">KESH Admin</CardTitle>
        <CardDescription className="text-center">Silakan masuk ke akun Anda</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 
          Using a standard HTML form POST to /api/auth/signin/credentials 
          to hide the request payload from the browser's Fetch/XHR network tab.
          Note: NextAuth v4 expects the 'signin' endpoint for the initial POST.
        */}
        <form 
          method="POST" 
          action="/api/auth/signin/credentials" 
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input type="hidden" name="csrfToken" value={csrfToken ?? ''} />
          <input type="hidden" name="callbackUrl" value="/dashboard" />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="admin@kesh.co.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-border"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !csrfToken}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? 'Sedang masuk...' : 'Masuk'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Gunakan email dan password admin Anda untuk masuk
        </p>
      </CardContent>
    </Card>
  )
}
