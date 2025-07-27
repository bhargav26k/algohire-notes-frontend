'use client'

import { MentionsInput, Mention } from 'react-mentions'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import mentionStyle from './mentionStyles'
import { useAuth } from '@/context/auth-context'

type UserMention = { id: string; display: string }

export default function MentionInput({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [users, setUsers] = useState<UserMention[]>([])
    const { user } = useAuth()

    useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await api.get<{ id: string; username: string }[]>('/users') 
        const filtered = data
  .filter((u) => u.username  !== user?.username  )
  .map((u) => ({
    id: u.username,
    display: u.username,
  }))

// Ensure unique usernames
const unique = Array.from(new Map(filtered.map(u => [u.id, u])).values())

setUsers(unique)
    console.log('Fetched users for mentions:', unique) // <-- log here

      } catch (err) {
        console.error('Error fetching users:', err)
        setUsers([])
      }
    }
    if (user) fetchUsers()
      console.log('Users for mentions:', users)

  }, [user])


  return (
    <div className="relative w-full">
    <MentionsInput
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      style={mentionStyle}
        markup="@__display__"
  className=" flex-1 w-full focus:outline-none"
      placeholder="Type @ to mention someone..."
    >
      <Mention
  trigger="@"
  data={users}
  markup="@__display__" 
  displayTransform={(id: string, display: string) => `@${display}`}
/>
    </MentionsInput>
    </div>
  )
}
