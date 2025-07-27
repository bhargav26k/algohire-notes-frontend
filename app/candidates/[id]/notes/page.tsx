'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams  } from 'next/navigation'
import socket from '@/lib/socket'
import axios from '@/lib/axios'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { formatDistanceToNow } from 'date-fns'
import MentionInput from '@/components/MentionInput'
import { highlightMentions } from '@/lib/utils'
import toast from 'react-hot-toast'
import CandidateDocuments from '@/components/CandidateDocuments'
import { Candidate } from '@/types/candidate'
import { ArrowLeft } from 'lucide-react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'

type Note = {
  id: string
  content: string
  sender: { 
    username: string 
  }

  createdAt: string
}

export default function CandidateNotesPage() {
    const { user } = useAuth()
    const router = useRouter()
  const { id: candidateId } = useParams()
    const searchParams = useSearchParams()
  const highlightNoteId = searchParams.get('highlight')

    const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [allUsers, setAllUsers] = useState<{ id: string; username: string }[]>([]) 
  const [message, setMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (user === undefined) return
    if (user === null) router.push('/login')
  }, [user, router])

  useEffect(() => {
  if (!user || !candidateId) return

    // Fetch candidate
    api.get<Candidate>(`/candidates/${candidateId}`)
      .then((res) => setCandidate(res.data))
      .catch((err) => console.error('Error fetching candidate:', err))

    // Fetch existing notes
    api.get<Note[]>(`/notes/${candidateId}`)
      .then((res) => setNotes(res.data))
      .catch((err) => console.error('Error fetching notes:', err))

    // Join socket room
    socket.emit('joinRoom', candidateId)

    // Handle incoming messages
    const onMessage = (newNote: Note) => {
      setNotes((prev) => [...prev, newNote])

      // If current user was mentioned, show toast
      const mentionRegex = new RegExp(`@${user.username}(\\b|\\s|\\W)`, 'i')
      if (mentionRegex.test(newNote.content)) {
        toast.success(`🔔 You were mentioned by ${newNote.sender.username}`)
      }
    }

    socket.on('messageSent', onMessage)
    return () => {
      socket.off('messageSent', onMessage)
    }
  }, [candidateId, user])

  // Fetch all users for Mentions autocomplete & highlighting
  useEffect(() => {
    if (!user) return
    api.get<User[]>('/users')
      .then((res) => setAllUsers(res.data))
      .catch((err) => {
        console.error('Failed to fetch users:', err)
        setAllUsers([])
      })
  }, [user])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [notes])

  // Scroll & highlight if `highlight` query param present
  useEffect(() => {
    if (!highlightNoteId) return
    const el = document.getElementById(highlightNoteId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('bg-yellow-100')
      setTimeout(() => el.classList.remove('bg-yellow-100'), 2500)
    }
  }, [highlightNoteId, notes])

  // Send a new note
  const handleSend = () => {
    if (!message.trim() || !candidateId || !user) return
    socket.emit('sendMessage', {
      candidateId,
      content: message,
      senderId: user.id,
    })
    setMessage('')
  }

  // Helper to convert UTC string to local Date
  const convertUtcToLocal = (utc: string) => {
    const d = new Date(utc)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  }

  // Show loading while auth state resolves
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
  <div className="h-screen flex flex-col">
    {/* Fixed Header */}
    <header className="bg-background border-b p-4 flex items-center justify-between sticky top-0 z-10">
      <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <h1 className="text-lg font-semibold">
        Notes for Candidate: <span className="text-primary ">{candidate?.name ?? '...'}</span>
      </h1>
    </header>

      {/* Main: Desktop: side-by-side; Mobile: tabs */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Notes */}
          <section className="flex-1 flex flex-col border-r">
            <div className="flex-1 px-4 md:mx-16 mx-4 pt-4 overflow-y-auto space-y-4"> {/* <== edited: responsive mx */}
              {notes.length === 0 ? (
                <div className="text-muted-foreground text-center mt-10 text-sm">
                  No notes yet.
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} id={note.id} className="bg-background p-4 rounded shadow-sm border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {note.sender.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p
                      className="text-sm"
                       dangerouslySetInnerHTML={{
                __html: highlightMentions(note.content, allUsers.map(u => ({ id: u.id, username: u.username }))),
              }}
                    />
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>

            <div className="border-t px-4 md:mx-16 mx-4 py-3 bg-background flex items-center gap-2">
              <MentionInput value={message} onChange={setMessage} />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="w-1/3 bg-muted border-l p-4 overflow-y-auto">
            <h2 className="text-md font-medium mb-2">📁 Shared Documents</h2>
            <CandidateDocuments candidateId={candidateId as string} />
          </aside>
        </div>

        {/* Mobile Layout: Tabs */}
        <div className="flex flex-col md:hidden flex-1 overflow-hidden"> {/* <== edited: mobile-only */}
          <Tabs defaultValue="notes" className="h-full flex flex-col mt-2  ">
            <TabsList className='mx-auto'>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="docs">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 px-4 mx-4 pt-4 overflow-y-auto space-y-4">
                {notes.length === 0 ? (
                  <div className="text-muted-foreground text-center mt-10 text-sm">
                    No notes yet.
                  </div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} id={note.id} className="bg-background p-4 rounded shadow-sm border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {note.sender.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    <p
                        className="text-sm"
                        dangerouslySetInnerHTML={{
                          __html: highlightMentions(
                            note.content,
                            allUsers.map(u => ({ id: u.id, username: u.username }))
                          ),                         // <== edited: highlightMentions here too
                        }}
                      />
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>
              <div className="border-t px-4 mx-4 py-3 bg-background flex items-center gap-2">
                <MentionInput value={message} onChange={setMessage} />
                <Button onClick={handleSend}>Send</Button>
              </div>
            </TabsContent>

            <TabsContent value="docs" className="p-4 overflow-y-auto flex-1">
              <CandidateDocuments candidateId={candidateId as string} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
