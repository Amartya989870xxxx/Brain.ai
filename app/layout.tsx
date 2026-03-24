import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Brain.ai - Your Personal AI Second Brain',
  description: 'Upload your study materials and learn faster with AI-powered chat, summaries, flashcards, and mindmaps. Notion + Perplexity + ChatGPT for students.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { PillBase } from '@/components/ui/3d-adaptive-navigation-bar'
import { AuthProvider } from '@/components/auth/auth-provider'
import { AuthButtons } from '@/components/auth/auth-buttons'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-black text-white">
        <AuthProvider>
          {/* Navigation pill - center */}
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <PillBase />
          </div>

          {/* Auth buttons - top right */}
          <div className="fixed top-6 right-6 z-50">
            <AuthButtons />
          </div>

          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
