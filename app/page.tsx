'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login') // or '/dashboard' if user is logged in
  }, [])

  return <p>Redirecting...</p>
}
