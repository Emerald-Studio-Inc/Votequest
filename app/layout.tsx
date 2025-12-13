import type { Metadata } from 'next'
import './globals.css'
import './gold.css'
import './mobile.css'
import './mobile-enhancements.css'

export const metadata: Metadata = {
  title: 'VoteQuest - Decentralized Governance',
  description: 'A gamified blockchain voting platform',
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
