'use client'

import { useEffect } from 'react'
import socket from '@/lib/socket'
import { useAuth } from '@/context/auth-context'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function NotificationListener() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) return

    // Join user-specific room for notifications
    socket.emit('joinRoom', user.id)

    // Listen for notify events
    socket.on('notify', (data: { candidateId: string; noteId: string }) => {
      toast((t) => (
        <span
          onClick={() => {
            toast.dismiss(t.id)
            router.push(`/candidates/${data.candidateId}/notes?highlight=${data.noteId}`)
          }}
          className="cursor-pointer text-sm"
        >
          🔔 You were mentioned in a note! Click to view.
        </span>
      ))
    })

    return () => {
      socket.off('notify')
    }
  }, [user?.id])
  
  return null
}
