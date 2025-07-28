'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import CandidateCard from '@/components/CandidateCard'
import CandidateForm from '@/components/CandidateForm'
import NotificationsCard from '@/components/NotificationsCard'
import { Candidate } from '@/types/candidate'
import { Dialog, DialogContent } from '@/components/ui/dialog' 
import { useMediaQuery } from '@/lib/use-media-query' 


import {
  BellIcon,
  SearchIcon,
  UserIcon,
  LogOut,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filtered, setFiltered] = useState<Candidate[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [showNotif, setShowNotif] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const [page, setPage] = useState(1)
  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const isMobile = useMediaQuery('(max-width: 768px)') 

// Redirect if not authenticated
  useEffect(() => {
    if (user === undefined) return
    if (user === null) router.push('/login')
  }, [user, router])

  // Load candidates + unread count in one go
    // Combined reload function
  const reloadData = async () => {
    setLoading(true)
    try {
      // Note the Notification shape includes isRead?
      const [cRes, nRes] = await Promise.all([
        api.get<Candidate[]>('/candidates'),
          api.get<{
          noteId: string
          content: string
          sender: string
          candidateId: string
          candidateName: string
          createdAt: string
          isRead?: boolean
        }[]>('/notifications'),
        ])
        setCandidates(cRes.data)
      const unread = nRes.data.filter((n) => !n.isRead).length
        setUnreadCount(unread)
      } catch (err) {
      console.error('Error loading dashboard data:', err)
      // On 401, our interceptor already calls logout()
    } finally {
      setLoading(false)
    }
  }

    // Redirect if not authenticated, or load data once we know user
  useEffect(() => {
    if (user === undefined) return
    if (user === null) {
      router.push('/login')
    } else {
      reloadData()
    }
  }, [user, router])



  // Filter on search
  useEffect(() => {
    const f = candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(f)
    setPage(1)
  }, [search, candidates])


  const handleLogout = () => logout()
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="flex justify-between items-center p-6 bg-white shadow">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Real-time candidate management
          </p>
        </div>
        <div className="flex items-center gap-4">
                    <CandidateForm onCreated={reloadData} />


          {/* Notifications Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNotif((v) => !v)}
            >
              <BellIcon className="h-5 w-5" />
            </Button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage
                src={`/avatars/${user?.id}.png`}
                alt={user?.name}
              />
              <AvatarFallback>
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user?.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5 rotate-180" />
            </Button>
          </div>
        </div>
      </header>
<div className='px-4'>
      {/* MAIN & NOTIFICATIONS WRAPPER */}
      <div className="relative mt-8 px-8 h-[75vh] overflow-hidden">
        {/* Main Section */}
        <div
          className={`
            absolute top-0 transform transition-all duration-500 ease-in-out
            bg-white border rounded-xl shadow-md p-6 flex flex-col h-full
            ${showNotif
              ? 'w-2/3 left-0 translate-x-0'
              : 'w-4/5 left-1/2 -translate-x-1/2'}
          `}
        >
          {/* SEARCH */}
          <div className="flex items-center mb-4 shrink-0">
            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />&nbsp;
            <Button variant="outline" size="icon" disabled>
              <SearchIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* GRID or SKELETON */}
           <div
              className="
                flex-1 overflow-auto mb-4
                [&::-webkit-scrollbar]:w-2             // <= very thin 2px WebKit scrollbar  //<==
                [&::-webkit-scrollbar]:h-2             // <= very thin 2px WebKit scrollbar  //<==
                [scrollbar-width:thin]                 // <= Firefox thin scrollbar        //<==
                [&::-webkit-scrollbar-thumb]:bg-gray-300 // <= thumb color                  //<==
                [&::-webkit-scrollbar-track]:bg-transparent // <= track color              //<==
              "
            >
          <div className="
                grid
                grid-cols-1            /* default: 1 col */
                md:grid-cols-2         /* ≥768px: 2 cols */   
                lg:grid-cols-3         /* ≥1024px: 3 cols */   
                gap-4
              "
>
            {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                  ))
                ) : filtered.length === 0 ? (               
                  <div className="col-span-full text-center py-10"> 
                    <p className="text-muted-foreground mb-4">
                      No candidates yet! You can add new using "Add Candidate".
                    </p>                           
                    {/* <CandidateForm onCreated={reloadData} /> */}
                  </div>                        
                ) : (
                  paginated.map((candidate) => (    
                    <CandidateCard
                      key={candidate.id}        
                      candidate={candidate}       
                    />
                  ))
                )}
          </div>
          </div>

          {/* PAGINATION */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span className="self-center">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Notifications Panel */}
        {!isMobile && (
        <div
          className={`
            absolute top-0 right-0 transform transition-transform duration-500 ease-in-out
            bg-white border rounded-xl shadow-md p-6 h-full overflow-auto
            ${showNotif ? 'translate-x-0' : 'translate-x-full'}
          `}
          style={{ width: '30%' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotif(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <NotificationsCard onUnreadCount={(c) => setUnreadCount(c)} />
        </div>
        )}

                  {/* Mobile Modal Notifications */}
          {isMobile && (
            <Dialog open={showNotif} onOpenChange={setShowNotif}> {/* <== edited line */}
              <DialogContent className="p-6 max-w-full sm:max-w-lg h-[90vh] overflow-y-auto"> {/* <== edited line */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  {/* <Button variant="ghost" size="icon" onClick={() => setShowNotif(false)}>
                    <X className="h-5 w-5" />
                  </Button> */}
                </div>
                <NotificationsCard onUnreadCount={(c) => setUnreadCount(c)} />
              </DialogContent>
            </Dialog>
          )}

        </div>
      </div>
      
    </div>
  )
}
