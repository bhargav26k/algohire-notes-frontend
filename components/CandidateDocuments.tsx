'use client'

import { useEffect, useRef, useState } from 'react'
import axios from '@/lib/axios'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

type Document = {
  id: string
  fileName: string
  filePath: string
  uploadedAt: string
}

export default function CandidateDocuments({ candidateId }: { candidateId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load documents
  const fetchDocs = async () => {
    try {
      const { data } = await api.get<Document[]>(`/candidate-documents/${candidateId}`)
      setDocs(data)
    } catch (err) {
      console.error('Error loading documents:', err)
      toast.error('Error loading documents')
    }
  }

  useEffect(() => {
    if (candidateId) fetchDocs()
  }, [candidateId])

  // Upload handler
  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file')
    const form = new FormData()
    form.append('file', file)
    form.append('candidateId', candidateId)

    try {
      await api.post('/candidate-documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Document uploaded')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchDocs()
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Upload failed')
    }
  }


    const convertUtcToLocal = (utc: string) => {
    const localDate = new Date(utc)
    const localOffsetMs = localDate.getTimezoneOffset() * 60000
    return new Date(localDate.getTime() - localOffsetMs)
  }


  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-bold">Shared Documents</h3>

      {/* Upload */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
  type="file"
  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
  ref={fileInputRef}
  onChange={(e) => {
    const selected = e.target.files?.[0] || null

    if (selected) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ]

      if (!allowedTypes.includes(selected.type)) {
        toast.error('Invalid file type. Allowed: PDF, DOC, JPG, PNG.')
        e.target.value = '' // reset file input
        setFile(null)
        return
      }

      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max 5MB allowed.')
        e.target.value = ''
        setFile(null)
        return
      }

      setFile(selected)
    } else {
      setFile(null)
    }
  }}
  className="max-w-sm"
/>

        <Button onClick={handleUpload}>Upload Document</Button>
      </div>

      {/* Document List */}
      <div className="border rounded-md bg-muted">
  <div className="divide-y overflow-y-auto max-h-[250px]">
    {docs.length === 0 ? (
      <div className="p-4 text-sm text-muted-foreground">No documents uploaded.</div>
    ) : (
      docs.map((doc) => (
        <Dialog key={doc.id}>
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">{doc.fileName}</p>
              <p className="text-xs text-muted-foreground">
                Uploaded {formatDistanceToNow(new Date(convertUtcToLocal(doc.uploadedAt)))} ago
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/uploads/${doc.filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Download
              </a>

              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </DialogTrigger>
            </div>
          </div>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this document?</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <b>{doc.fileName}</b>? This action cannot be undone.
            </p>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => document.activeElement?.dispatchEvent(new Event('click'))}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                                        try {
                          await api.delete(`/candidate-documents/${doc.id}`)
                          toast.success('Document deleted')
                          fetchDocs()
                        } catch (err) {
                          console.error('Deletion failed:', err)
                          toast.error('Failed to delete')
                        }
                      }}
              >
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))
    )}
  </div>
</div>

    </div>
  )
}
