'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FloatingMenu } from '@/components/dashboard/floating-menu'
import { UploadArea } from '@/components/dashboard/upload-area'
import { useAuth } from '@/components/auth/auth-provider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { FileText, Database, Zap, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ docs: 0, chunks: 0 })
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Explorer'

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    const supabase = createSupabaseBrowserClient()
    
    const { count: docsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)

    const { count: chunksCount } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)

    setStats({ docs: docsCount || 0, chunks: chunksCount || 0 })
  }

  return (
    <div className="relative min-h-screen bg-[#000000] overflow-hidden text-white font-sans selection:bg-indigo-500/30">
      {/* Background Decorative Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/[0.08] rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 100, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-rose-600/[0.05] rounded-full blur-[100px]" 
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] opacity-[0.03] pointer-events-none" />

      {/* Floating Side Menu */}
      <FloatingMenu />

      <main className="relative z-10 container mx-auto flex flex-col pt-32 pb-16 px-6 md:px-12 lg:px-24">
        {/* Welcome Header */}
        <div className="mb-12 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">{firstName}</span>
            </h1>
            <p className="text-white/40 mt-3 text-lg font-medium">Manage your digital consciousness and knowledge clusters.</p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Knowledge Source', value: `${stats.docs} Documents`, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Neural Index', value: `${stats.chunks} Chunks`, icon: Database, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { label: 'System Status', value: 'Optimized', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex items-center gap-4 backdrop-blur-xl hover:bg-white/[0.05] transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</p>
                <p className="text-lg font-semibold text-white/90">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upload Interface Area */}
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <UploadArea />
        </div>

        {/* Footnote */}
        <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <Clock className="w-3 h-3" />
          Last active: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Sync Protocol Active
        </div>
      </main>
    </div>
  )
}
