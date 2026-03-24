'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/auth/auth-provider'
import { LogIn, LogOut, User, ChevronDown, Settings, UserCircle } from 'lucide-react'

export function AuthButtons() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
      </div>
    )
  }

  // Logged in — show avatar with dropdown
  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

    return (
      <div className="relative">
        <motion.button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/50"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-500/30 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-300" />
            </div>
          )}
          <span className="text-sm font-medium text-white/80 hidden sm:block max-w-[120px] truncate">
            {name}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Click-away overlay */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl bg-[#1a1a2e]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-medium text-white truncate">{name}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-4 py-3 flex items-center gap-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-4 py-3 flex items-center gap-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <div className="border-t border-white/5">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      signOut()
                    }}
                    className="w-full px-4 py-3 flex items-center gap-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Not logged in — show Login & Signup buttons
  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-xl"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Log In</span>
      </motion.button>

      <motion.button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/25"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign Up
      </motion.button>
    </div>
  )
}
