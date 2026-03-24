'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { CloudUpload, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UploadArea() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mouseXSpring = useTransform(x, [-0.5, 0.5], [15, -15])
  const mouseYSpring = useTransform(y, [-0.5, 0.5], [-15, 15])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5
    x.set(normalizedX)
    y.set(normalizedY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 min-h-screen">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.txt"
      />
      
      <motion.div
        style={{ rotateX: mouseYSpring, rotateY: mouseXSpring, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative w-full max-w-2xl aspect-video rounded-3xl",
          "bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08]",
          "flex items-center justify-center group cursor-pointer",
          "shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]",
          "transition-colors hover:bg-white/[0.04]"
        )}
      >
        <div style={{ transform: "translateZ(50px)" }} className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center border transition-colors",
              uploadSuccess ? "bg-green-500/10 border-green-500/20" : "bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500/20"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            ) : uploadSuccess ? (
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            ) : (
              <CloudUpload className="w-10 h-10 text-indigo-400" />
            )}
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center space-y-2"
          >
            <h3 className="text-2xl font-semibold text-white tracking-tight">
              {isUploading ? 'Building Brain...' : uploadSuccess ? 'Knowledge Added!' : 'Upload Knowledge'}
            </h3>
            <p className="text-white/50 max-w-sm mx-auto">
              {isUploading 
                ? 'Parsing document and embedding knowledge...' 
                : 'Drag and drop your study materials here, or click to browse. Max 20 documents.'}
            </p>
          </motion.div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] rounded-3xl [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl bg-indigo-500/10 pointer-events-none rounded-3xl" />
      </motion.div>
    </div>
  )
}

