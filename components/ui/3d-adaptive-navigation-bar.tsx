'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useSpring, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  id: string
  path: string
}

/**
 * 3D Adaptive Navigation Pill
 * Smart navigation with scroll detection and hover expansion - Dark Mac Glassmorphism Effect
 */
export const PillBase: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  
  // Determine active section based on current path
  const [activeSection, setActiveSection] = useState(pathname === '/dashboard' ? 'dashboard' : 'home')
  
  const [expanded, setExpanded] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const navItems: NavItem[] = [
    { label: 'Home', id: 'home', path: '/' },
    { label: 'Dashboard', id: 'dashboard', path: '/dashboard' },
    { label: 'Vault', id: 'vault', path: '/vault' },
    { label: 'Academia', id: 'academia', path: '/academia' },
  ]

  useEffect(() => {
    const currentItem = navItems.find(item => pathname === item.path)
    if (currentItem) {
      setActiveSection(currentItem.id)
    } else if (pathname === '/profile') {
      setActiveSection('profile')
    } else if (pathname === '/settings') {
      setActiveSection('settings')
    } else {
      setActiveSection('home')
    }
  }, [pathname])

  // Spring animations for smooth motion
  const pillWidth = useSpring(140, { stiffness: 220, damping: 25, mass: 1 })
  const pillShift = useSpring(0, { stiffness: 220, damping: 25, mass: 1 })

  // Handle hover expansion
  useEffect(() => {
    if (hovering) {
      setExpanded(true)
      pillWidth.set(520) // adjusted for 4 items
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false)
        pillWidth.set(140)
      }, 600)
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [hovering, pillWidth])

  const handleMouseEnter = () => {
    setHovering(true)
  }

  const handleMouseLeave = () => {
    setHovering(false)
  }

  const handleSectionClick = (sectionId: string, path: string) => {
    setIsTransitioning(true)
    setActiveSection(sectionId)
    setHovering(false)
    router.push(path)
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 400)
  }

  const activeItem = navItems.find(item => item.id === activeSection) || 
    (activeSection === 'profile' ? { label: 'Profile', id: 'profile', path: '/profile' } : 
     activeSection === 'settings' ? { label: 'Settings', id: 'settings', path: '/settings' } : 
     navItems[0])

  return (
    <motion.nav
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-full pointer-events-auto",
        "bg-white/5 backdrop-blur-[24px] saturate-150",
        "border border-white/10"
      )}
      style={{
        width: pillWidth,
        height: '56px',
        WebkitBackdropFilter: 'blur(24px)', // Important for Safari/iOS compatibility
        boxShadow: expanded
          ? `
            0 2px 4px rgba(0, 0, 0, 0.2),
            0 6px 12px rgba(0, 0, 0, 0.3),
            0 12px 24px rgba(0, 0, 0, 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.15)
          `
          : `
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 1px rgba(255, 255, 255, 0.1)
          `,
        x: pillShift,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-out, background 0.3s ease-out',
      }}
    >
      {/* Primary top edge ridge - highlights */}
      <div 
        className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
          filter: 'blur(0.5px)',
        }}
      />
      
      {/* Inner diffuse glow to mimic Mac glossy material */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.03)',
        }}
      />

      {/* Navigation items container */}
      <div 
        ref={containerRef}
        className="relative z-10 h-full flex items-center justify-center px-4"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
        }}
      >
        {/* Collapsed state - show only active section with smooth text transitions */}
        {!expanded && (
          <div className="flex items-center relative">
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.span
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.35,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#ffffff',
                    letterSpacing: '0.45px',
                    whiteSpace: 'nowrap',
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  {activeItem.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Expanded state - show all sections with stagger */}
        {expanded && (
          <div className="flex items-center justify-evenly w-full">
            {navItems.map((item, index) => {
              const isActive = item.id === activeSection
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.25,
                    ease: 'easeOut'
                  }}
                  onClick={() => handleSectionClick(item.id, item.path)}
                  className="relative cursor-pointer transition-all duration-200"
                  style={{
                    fontSize: isActive ? '15px' : '15px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 16px',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    transform: isActive ? 'translateY(-1.5px)' : 'translateY(0)',
                    textShadow: isActive ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                      e.currentTarget.style.transform = 'translateY(-0.5px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  {item.label}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </motion.nav>
  )
}
