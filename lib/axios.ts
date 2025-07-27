// frontend/lib/axios.ts
import axios, { AxiosError,AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { logout } from '@/context/auth-context' // note: we’ll expose a logout fn
import toast from 'react-hot-toast'  

// Create an axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

// Request interceptor: attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void
  reject: (err: any) => void
}[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}


// Handle 401s
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`
              }
              resolve(api(originalRequest))
            },
            reject: (err: any) => {
              reject(err)
            },
          })
        })
      }

      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')

      try {
        const { data } = await axios.post(
          '/auth/refresh', {
          refreshToken
        },  { withCredentials: true } )

        const newAccessToken = data.accessToken
        localStorage.setItem('token', newAccessToken)

        processQueue(null, newAccessToken)

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        }

        return api(originalRequest)
      } catch (refreshErr: any) {
        processQueue(refreshErr, null)

        // <== Show a friendly toast instead of raw JSON
        const msg =
          refreshErr?.response?.data?.message ||
          'Session expired. Please log in again.'
        toast.error(msg)

        logout()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

        // For other 401s (e.g. login), extract and toast the server message
    if (error.response?.status === 401 && originalRequest._retry) {
      const msg =
        (error.response.data as any)?.message || 'Unauthorized request'
      toast.error(msg)
    }


    return Promise.reject(error)
  }
)

export default api

