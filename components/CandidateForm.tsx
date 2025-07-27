'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'
import { toast } from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function CandidateForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  // Field-level validation
  const validateField = (field: 'name' | 'email') => {
    setErrors((errs) => {
      const next = { ...errs }
      if (field === 'name') {
        if (!name.trim()) next.name = 'Name is required'
        else delete next.name
      } else {
        if (!email.trim()) next.email = 'Email is required'
        else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Invalid email'
        else delete next.email
      }
      return next
    })
  }

  // Full-form validation before submit
  const validateForm = () => {
    validateField('name')
    validateField('email')
    return !errors.name && !errors.email && name.trim() !== '' && email.trim() !== ''
  }

  const handleCreate = async () => {
    if (!validateForm()) return
    setSubmitting(true)
    try {
      await api.post('/candidates', {
        name: name.trim(),
        email: email.trim(),
      })
      toast.success('Candidate created!')
      setName('')
      setEmail('')
      setErrors({})
      onCreated()
    } catch (err) {
      console.error('Error creating candidate:', err)
      toast.error('Error creating candidate')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <Plus /> Add Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Candidate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <Input
              id="name"
              placeholder="Candidate Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((e) => ({ ...e, name: undefined })) // clear on change
              }}
              onBlur={() => validateField('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((e) => ({ ...e, email: undefined })) // clear on change
              }}
              onBlur={() => validateField('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleCreate}
            disabled={
              submitting ||
              Boolean(errors.name) ||
              Boolean(errors.email) ||
              !name.trim() ||
              !email.trim()
            }
            className="w-full"
          >
            {submitting ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
