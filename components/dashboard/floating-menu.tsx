'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Settings, User, Menu, X, Vault, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => setIsOpen(!isOpen)

  const menuItems = [
    { icon: Plus, label: 'Digital Academia', onClick: () => { router.push('/academia'); setIsOpen(false) } },
    { icon: BookOpen, label: 'Knowledge Vault', onClick: () => { router.push('/vault'); setIsOpen(false) } },
    { icon: Settings, label: 'Settings', onClick: () => { router.push('/settings'); setIsOpen(false) } },
    { icon: User, label: 'Profile', onClick: () => { router.push('/profile'); setIsOpen(false) } },
  ]

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              "flex flex-col gap-2 p-3 rounded-2xl",
              "bg-white/5 backdrop-blur-xl border border-white/10",
              "shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
            )}
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={item.onClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                    "text-sm font-medium text-white/80 hover:text-white",
                    "hover:bg-white/10 transition-colors group"
                  )}
                >
                  <Icon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full",
          "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg",
          "shadow-indigo-500/20 backdrop-blur-xl border border-white/10",
          "transition-colors"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
