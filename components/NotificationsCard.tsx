'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

type Notification = {
  noteId: string
  content: string
  sender: string
  candidateId: string
  candidateName: string
  createdAt: string
  isRead?: boolean // optional fallback
}

interface NotificationsCardProps {
  onUnreadCount?: (count: number) => void
}

export default function NotificationsCard({
  onUnreadCount,
}: NotificationsCardProps) {

const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

    const convertUtcToLocal = (utc: string) => {                   
    const d = new Date(utc)                                     
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)  
  }                                                              


    useEffect(() => {
async function fetchNotifications() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null // <== check for token
      if (!token) {
        console.warn('No token found, skipping notifications fetch') // <==
        setNotifications([])
        onUnreadCount?.(0)
        return
      }

      try {
        const { data } = await axios.get<Notification[]>('/notifications')
        const seen = new Set()
        const unique = data.filter((n) => {
          if (seen.has(n.noteId)) return false
          seen.add(n.noteId)
          return true
        }) 
        setNotifications(unique)
        const unread = unique.filter((n) => !n.isRead).length
        onUnreadCount?.(unread)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        setNotifications([])
        onUnreadCount?.(0)
      }
    }
    fetchNotifications()
  }, [onUnreadCount])


const handleRedirect = async (
    candidateId: string,
    noteId: string,
    isRead?: boolean
  ) => {
      let updatedNotifications = notifications

    if (!isRead) {
      try {
        await axios.patch(`/notifications/${noteId}/read`)
        const updatedNotifications  = notifications.map((n) =>
          n.noteId === noteId ? { ...n, isRead: true } : n
        )

        const deduped = Array.from(
          new Map(updatedNotifications .map((n) => [n.noteId, n])).values()
        ) 

        setNotifications(deduped)
        onUnreadCount?.(deduped.filter((n) => !n.isRead).length)
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    }
    router.push(`/candidates/${candidateId}/notes?highlight=${noteId}`)
  }

  return (
    <ScrollArea className="h-[400px] pr-2">
      <div className="space-y-3">
        {notifications.length === 0 && (
          <p className="text-sm text-muted-foreground">No new notifications.</p>
        )}
        {notifications.map((n: any, index) => (
          <div
            key={`${n.noteId}-${index}`}
            onClick={() => handleRedirect(n.candidateId, n.noteId, n.isRead)}

className={clsx(
              'p-3 rounded-md transition cursor-pointer border',
!!n.isRead
  ? 'bg-muted hover:bg-accent'
  : 'bg-primary/10 border-primary text-primary hover:bg-primary/20'

            )}
          >
            <p className="text-sm font-medium">
              <b>{n.sender}</b>: {n.content.slice(0, 50)}...
            </p>
            <p className="text-xs text-muted-foreground">
              In <b>{n.candidateName}</b> • {formatDistanceToNow(
                convertUtcToLocal(n.createdAt),    // <== use local time
                { addSuffix: true }
              )}
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
