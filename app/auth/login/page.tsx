'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'  

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock authentication - just validate basic input
    if (email && password) {
      // Set a mock session token in localStorage
      localStorage.setItem('auth_token', 'mock-token-' + Date.now())
      localStorage.setItem('user_email', email)
      
      // Redirect to dashboard
      router.push('/')
    }

    setIsLoading(false)
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
        <CardDescription className="text-center">Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
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
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Demo credentials: Use any email and password to login
        </p>
      </CardContent>
    </Card>
  )
}
