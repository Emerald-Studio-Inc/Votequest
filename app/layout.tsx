import type { Metadata, Viewport } from 'next'
import './globals.css'
import './blue-theme.css'
import './blue-utilities.css'
import './mobile.css'
import './mobile-enhancements.css'

export const metadata: Metadata = {
  title: {
    template: '%s | VoteQuest',
    default: 'VoteQuest | Gamified Decentralized Governance',
  },
  description: 'Participate in the future of governance. Cast immutable votes, earn VQC tokens, and influence organizations in a high-fidelity cyberpunk environment.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VoteQuest',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { Providers } from './providers'
import ToastContainer from '@/components/ToastContainer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-sans scanlines cyber-grid" suppressHydrationWarning>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
