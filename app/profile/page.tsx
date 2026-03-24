'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { User, Mail, FileText, GraduationCap, Calendar, Pencil, Check, X, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [docCount, setDocCount] = useState(0)

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    const supabase = createSupabaseBrowserClient()
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
    setDocCount(count || 0)
  }

  const handleSaveName = async () => {
    if (!displayName.trim()) return
    setSaving(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.updateUser({
      data: { full_name: displayName.trim() }
    })
    setSaving(false)
    setEditing(false)
  }

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 px-4 sm:px-6 pb-16">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Profile Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center ring-4 ring-indigo-500/30">
                <User className="w-12 h-12 text-indigo-400" />
              </div>
            )}

            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditing(false); setDisplayName(name) }}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{name}</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-white/40 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center backdrop-blur-xl">
            <FileText className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{docCount}</p>
            <p className="text-xs text-white/40 mt-1">Total Documents</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center backdrop-blur-xl">
            <GraduationCap className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-white/40 mt-1">Total Sessions</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center backdrop-blur-xl">
            <Calendar className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <p className="text-sm font-bold">{memberSince}</p>
            <p className="text-xs text-white/40 mt-1">Member Since</p>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
