'use client'

import VoteQuestApp from '@/components/VoteQuestApp'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { validateEnvironment, validateOptionalEnvironment } from '@/lib/env-validation'

// Validate environment on server startup
if (typeof window === 'undefined') {
  validateEnvironment();
  validateOptionalEnvironment();
}

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
