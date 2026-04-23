"use client"

import { useState, useRef } from "react"
import { Camera } from "lucide-react"

interface AvatarUploadProps {
  initialAvatarUrl?: string | null
  initials: string
}

export function AvatarUpload({ initialAvatarUrl, initials }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  return (
    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl overflow-hidden relative group shrink-0 shadow-inner">
      {previewUrl ? (
        <img src={previewUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
      ) : (
        <span className="uppercase">{initials}</span>
      )}
      
      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
        <Camera className="h-5 w-5 text-white mb-1" />
        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change</span>
        <input 
          type="file" 
          name="avatar" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </label>
    </div>
  )
}
