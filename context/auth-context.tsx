'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authApi from '@/lib/authApi'

interface AuthContextType {
  user: User | null | undefined 
  login: (email: string, password: string) => Promise<void>
  signup: ( username: string, name: string, email: string, password: string) => Promise<void>
  logout: () => void
}


const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => useContext(AuthContext)!

let globalLogout: () => void = () => {}

export function logout() {
  globalLogout()
}


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
const [user, setUser] = useState<User | null | undefined>(undefined) // undefined means "still loading"
  const router = useRouter()

   // assign for interceptor
  globalLogout = () => {
    setUser(null)
    localStorage.clear()
    router.push('/login')
  }

  useEffect(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    setUser(JSON.parse(userData))
  } else {
    setUser(null)
  }
}, [])


  const login = async (email: string, password: string) => {
    const { data } = await authApi.post('/auth/login', { email, password })
    setUser(data.user)
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push('/dashboard')
  }

  const signup = async ( username: string, name: string, email: string, password: string) => {
    const { data } = await authApi.post('/auth/signup', { username, name, email, password })
    setUser(data.user)
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push('/dashboard')
  }

  const logout = () => {
    setUser(null)
    localStorage.clear()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout: globalLogout }}>
      {children}
    </AuthContext.Provider>
  )
}
