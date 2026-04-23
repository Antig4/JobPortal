'use client'

import { FileText, Loader2 } from 'lucide-react'
import { viewResumeAndMarkViewed } from '@/app/(dashboard)/dashboard/actions'
import { useState } from 'react'

interface ResumeViewButtonProps {
  applicationId: string
  resumeUrl: string
}

export function ResumeViewButton({ applicationId, resumeUrl }: ResumeViewButtonProps) {
  const [opening, setOpening] = useState(false)

  const handleView = async () => {
    setOpening(true)
    
    // Open in new tab
    window.open(resumeUrl, '_blank')
    
    try {
      // Mark as viewed in background
      const formData = new FormData()
      formData.append('application_id', applicationId)
      await viewResumeAndMarkViewed(formData)
    } catch (err) {
      console.error('Failed to mark resume as viewed:', err)
    } finally {
      setOpening(false)
    }
  }

  return (
    <button
      onClick={handleView}
      disabled={opening}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-70"
    >
      {opening ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileText className="h-3.5 w-3.5" />
      )}
      {opening ? 'Opening...' : 'View Resume'}
    </button>
  )
}
