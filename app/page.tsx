'use client'

import VoteQuestApp from '@/components/VoteQuestApp'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { validateEnvironment, validateOptionalEnvironment } from '@/lib/env-validation'

// Validate environment on server startup
if (typeof window === 'undefined') {
  validateEnvironment();
  validateOptionalEnvironment();
}

import { Suspense } from 'react';

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-[var(--bg-void)] text-white overflow-hidden selection:bg-white/20">
        <div className="bg-noise"></div>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="loading-spinner"></div></div>}>
          <VoteQuestApp />
        </Suspense>
      </main>
    </ErrorBoundary>
  )
}
