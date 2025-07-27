// app/login/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'
import { toast } from 'react-hot-toast'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    let ok = true
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email')
      ok = false
    } else {
      setEmailError(null)
    }
    if (!password) {
      setPasswordError('Password is required')
      ok = false
    } else {
      setPasswordError(null)
    }
    return ok
  }

  const handleLogin = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Logged in successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid credentials'  
            toast.error(msg)                               
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left: Image */}
            <div className="relative w-1/2 hidden md:block">
        <Image
          src="/images/hiring.jpg"
          alt="Hiring"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center px-4">
          <h1 className="text-white text-4xl font-bold text-center">
            Collaborative Candidate Notes
          </h1>
          <p className="text-white text-sm mt-2">~ By Bhargav Karlapudi</p>
        </div>
      </div>


      {/* Right: Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() =>
                  !emailRegex.test(email)
                    ? setEmailError('Please enter a valid email')
                    : setEmailError(null)
                }
              />
              {emailError && (
                <p className="mt-1 text-sm text-destructive">{emailError}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() =>
                  !password
                    ? setPasswordError('Password is required')
                    : setPasswordError(null)
                }
              />
              {passwordError && (
                <p className="mt-1 text-sm text-destructive">{passwordError}</p>
              )}
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <p className="text-center text-sm">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-primary underline hover:text-primary/80"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
