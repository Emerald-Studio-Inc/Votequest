import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from './types'

interface AppState {
  user: User | null
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  addVotedProposal: (proposalId: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      addVotedProposal: (proposalId) => set((state) => ({
        user: state.user ? {
          ...state.user,
          votedProposals: [...state.user.votedProposals, proposalId]
        } : null
      }))
    }),
    {
      name: 'votequest-storage',
    }
  )
)
