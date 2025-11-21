'use client'

import VoteQuestApp from '@/components/VoteQuestApp'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-zinc-950 text-white overflow-hidden selection:bg-white/20">
      <div className="bg-noise"></div>
      <VoteQuestApp />
    </main>
  )
}
