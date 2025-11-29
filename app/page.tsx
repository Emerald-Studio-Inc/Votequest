'use client'

import VoteQuestApp from '@/components/VoteQuestApp'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-black text-white overflow-hidden selection:bg-white/20">
        <div className="bg-noise"></div>
        <VoteQuestApp />
      </main>
    </ErrorBoundary>
  )
}
