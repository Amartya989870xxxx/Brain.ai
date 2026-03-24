'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { Bot, User, Loader2, Sparkles, Send, Plus, History, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function DigitalAcademia() {
  const [inputValue, setInputValue] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat/academia',
    }),
  })
  const bottomRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    const msg = inputValue
    setInputValue('')
    await sendMessage({ text: msg })
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background Decorative Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 100, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px]" 
        />
      </div>

      {/* Desktop Sidebar (Mock) */}
      <div className="hidden md:flex w-72 border-r border-white/5 bg-black/40 backdrop-blur-xl flex-col z-20">
        <div className="p-4">
          <button className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3 text-sm font-medium group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            New Learning Session
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-3 py-4 text-[11px] font-bold text-white/30 uppercase tracking-widest">Recent Sessions</div>
          {[
            "Quantum Physics Basics",
            "Neuroscience and Memory",
            "React Server Components",
            "History of the Silk Road"
          ].map((topic, i) => (
            <button key={i} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2 group">
              <MessageSquare className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
              <span className="truncate">{topic}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 space-y-1">
          <button className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-white/40 hover:text-white transition-colors flex items-center gap-3">
            <History className="w-4 h-4" />
            Clear History
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="font-semibold text-white/90">Digital Academia</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-tighter">
              v1.0 • Gemini 1.5 Flash
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-0">
          <div className="max-w-3xl mx-auto py-12 space-y-8">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8 px-4">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20"
                >
                  <Bot className="w-10 h-10 text-white" />
                </motion.div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                    What would you like to learn today?
                  </h1>
                  <p className="text-white/40 max-w-md mx-auto leading-relaxed">
                    Digital Academia is your tireless AI mentor. Anything you discuss here is automatically etched into your Knowledge Vault.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    "Explain Quantum Entanglement simply",
                    "Teach me how to bake sourdough",
                    "Major events of the French Revolution",
                    "How do transformers in AI work?"
                  ].map((suggestion, i) => (
                    <button 
                      key={i}
                      onClick={() => sendMessage({ text: suggestion })}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left text-sm text-white/60 hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m: UIMessage) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m.id} 
                  className={cn("flex gap-4 md:gap-6", m.role === 'user' ? 'justify-end pr-4 md:pr-0' : 'justify-start pl-4 md:pl-0')}
                >
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/30 mt-1">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                  <div className={cn(
                    "px-1 py-1 rounded-2xl max-w-[85%] md:max-w-[75%] leading-relaxed text-[15px]",
                    m.role === 'user' ? 'bg-indigo-600/10 border border-indigo-500/20 text-white pr-4' : 'text-white/90'
                  )}>
                    <div className={cn("px-4 py-3", m.role === 'user' && "text-right font-medium")}>
                      {m.parts?.map((part, i) => part.type === 'text' ? <span key={i}>{part.text}</span> : null)}
                    </div>
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 mt-1">
                      <User className="w-4 h-4 text-white/40" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
            
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 md:gap-6 pl-4 md:pl-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                </div>
                <div className="space-y-2 py-2">
                  <div className="w-32 h-2 bg-white/5 rounded-full animate-pulse" />
                  <div className="w-48 h-2 bg-white/5 rounded-full animate-pulse" />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} className="h-32" />
          </div>
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={handleSubmit}
              className="relative group bg-[#111118]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 focus-within:border-blue-500/50 transition-all shadow-2xl"
            >
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask your AI mentor anything..." 
                className="w-full bg-transparent px-5 py-4 text-white focus:outline-none placeholder:text-white/20 sm:text-base"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-500 disabled:opacity-20 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
            <p className="text-[10px] text-center text-white/20 mt-3 font-medium uppercase tracking-widest">
              Digital Academia uses Gemini 1.5 Flash • Lessons are saved to your vault
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
