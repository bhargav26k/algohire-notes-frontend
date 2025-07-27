// app/signup/page.tsx
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

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({
    username: '' as string,
    name: '' as string,
    email: '' as string,
    password: '' as string,
  })
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = { username: '', name: '', email: '', password: '' }
    const usernameRegex = /^[a-zA-Z0-9_]+$/ 
    if (!username.trim()) errs.username = 'Username is required'
    else if (!usernameRegex.test(username))
      errs.username =
        'Username can only contain letters, numbers, and underscores'  

    if (!name.trim()) errs.name = 'Name is required'
    if (!emailRegex.test(email)) errs.email = 'Enter a valid email'
    if (password.length < 6)
      errs.password = 'Password must be at least 6 characters'
    setErrors(errs)
    return !errs.username && !errs.name && !errs.email && !errs.password
  }

  const handleSignup = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await signup(username, name, email, password)
      toast.success('Account created!')
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message
      if (msg.includes('Username')) {
        setErrors((e) => ({ ...e, username: msg }))                       // <== added
      } else if (msg.includes('Email')) {
        setErrors((e) => ({ ...e, email: msg }))
      } else {
        toast.error(msg)
      }
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
      </div>

      {/* Right: Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Username Field */}
            <div>
              <Input
                placeholder="Username"                                      
                value={username}                                       
                onChange={(e) => setUsername(e.target.value)} 
                onBlur={() =>
                  setErrors((e) => ({
                    ...e,
                    username: username.trim() ? '' : 'Username is required', 
                  }))
                }
              />
              {errors.username && (                                     
                <p className="mt-1 text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() =>
                  setErrors((e) => ({
                    ...e,
                    name: name.trim() ? '' : 'Name is required',
                  }))
                }
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() =>
                  setErrors((e) => ({
                    ...e,
                    email: emailRegex.test(email) ? '' : 'Enter a valid email',
                  }))
                }
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Password (min 6 chars)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() =>
                  setErrors((e) => ({
                    ...e,
                    password:
                      password.length >= 6
                        ? ''
                        : 'Password must be at least 6 characters',
                  }))
                }
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              onClick={handleSignup}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </Button>

            <p className="text-center text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary underline hover:text-primary/80"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
)
}
