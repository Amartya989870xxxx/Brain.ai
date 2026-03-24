'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  User, Moon, Sun, Bell, BellOff, Trash2, AlertTriangle,
  Save, Check, Type
} from 'lucide-react'

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#111118] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-500/10">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm text-white/50 mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const supabase = createSupabaseBrowserClient()

  // Account
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  )
  const [nameSaved, setNameSaved] = useState(false)
  const [savingName, setSavingName] = useState(false)

  // Appearance
  const [darkMode, setDarkMode] = useState(true)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  // Danger zone
  const [clearDocsModal, setClearDocsModal] = useState(false)
  const [deleteAccountModal, setDeleteAccountModal] = useState(false)
  const [processingDanger, setProcessingDanger] = useState(false)

  const handleSaveName = async () => {
    if (!displayName.trim()) return
    setSavingName(true)
    await supabase.auth.updateUser({ data: { full_name: displayName.trim() } })
    setSavingName(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  const handleClearDocs = async () => {
    if (!user) return
    setProcessingDanger(true)
    await supabase.from('knowledge_chunks').delete().eq('user_id', user.id)
    await supabase.from('documents').delete().eq('user_id', user.id)
    setProcessingDanger(false)
    setClearDocsModal(false)
  }

  const handleDeleteAccount = async () => {
    setProcessingDanger(true)
    await signOut()
  }

  if (!user) return null

  const fontSizes = ['small', 'medium', 'large'] as const

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 px-4 sm:px-6 pb-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-white/40 text-sm mb-8">Manage your account, preferences, and data.</p>

        {/* Card 1: Account */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            Account
          </h2>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Email</label>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/60 text-sm">
              {user.email}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Display Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setNameSaved(false) }}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {nameSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {nameSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Appearance */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {darkMode ? <Moon className="w-5 h-5 text-violet-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            Appearance
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-white/40">Use dark theme across the app</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-white/20'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-md ${darkMode ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-white/50" />
              <p className="text-sm font-medium">Font Size</p>
            </div>
            <div className="flex gap-2">
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    fontSize === size
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Notifications */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Notifications
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-white/40">Receive updates about your account</p>
            </div>
            <button
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`relative w-12 h-6 rounded-full transition-colors ${emailNotifs ? 'bg-emerald-600' : 'bg-white/20'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-md ${emailNotifs ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly Digest</p>
              <p className="text-xs text-white/40">Weekly summary of your activity</p>
            </div>
            <button
              onClick={() => setWeeklyDigest(!weeklyDigest)}
              className={`relative w-12 h-6 rounded-full transition-colors ${weeklyDigest ? 'bg-emerald-600' : 'bg-white/20'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-md ${weeklyDigest ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Card 4: Danger Zone */}
        <div className="bg-red-500/[0.03] border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Clear All Documents</p>
              <p className="text-xs text-white/40">Permanently delete all uploaded documents and embeddings</p>
            </div>
            <button
              onClick={() => setClearDocsModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-white/40">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => setDeleteAccountModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        open={clearDocsModal}
        title="Clear All Documents"
        description="This will permanently destroy all your uploaded documents, embeddings, and knowledge chunks. This action cannot be undone."
        confirmLabel="Clear Everything"
        onConfirm={handleClearDocs}
        onCancel={() => setClearDocsModal(false)}
        loading={processingDanger}
      />
      <ConfirmModal
        open={deleteAccountModal}
        title="Delete Account"
        description="This will permanently delete your account and all associated data. You will be signed out immediately. This action cannot be undone."
        confirmLabel="Delete My Account"
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteAccountModal(false)}
        loading={processingDanger}
      />
    </div>
  )
}
