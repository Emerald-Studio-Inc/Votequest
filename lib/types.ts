export interface User {
  id: string
  wallet_address: string
  level: number
  xp: number
  streak: number
  voting_power: number
  votes_count: number
  global_rank: number
  coins: number
  votedProposals: string[]
  created_at?: string
  updated_at?: string
}

export interface ProposalOption {
  id: number;
  title: string;
  allocation?: string;
  percentage?: string;
  votes: number;
  description: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  participants: number;
  timeLeft: string;
  endDate: Date;
  status: 'active' | 'closed' | 'pending';
  options: ProposalOption[];
}
