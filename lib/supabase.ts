import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type User = {
  id: string
  wallet_address: string
  level: number
  xp: number
  streak: number
  voting_power: number
  votes_count: number
  global_rank: number
  created_at: string
  updated_at: string
}

export type Proposal = {
  id: string
  title: string
  description: string
  status: 'active' | 'closed' | 'pending'
  participants: number
  end_date: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ProposalOption = {
  id: string
  proposal_id: string
  option_number: number
  title: string
  description: string | null
  allocation: string | null
  percentage: string | null
  votes: number
  created_at: string
}

export type Vote = {
  id: string
  user_id: string
  proposal_id: string
  option_id: string
  tx_hash: string | null
  voted_at: string
}
