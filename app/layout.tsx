import type { Metadata } from 'next'
import './globals.css'

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
      <body className="font-sans" suppressHydrationWarning>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
