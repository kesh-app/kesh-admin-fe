'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
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
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast.error('Gagal masuk. Mohon periksa kembali email dan password Anda.')
      } else if (res?.ok) {
        toast.success('Berhasil masuk!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat masuk. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
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
        <form 
          onSubmit={handleSubmit}
          className="space-y-4"
        >
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
            disabled={isLoading || !email || !password}
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
