export interface User {
  address: string | null;
  level: number;
  xp: number;
  nextLevelXP: number;
  streak: number;
  votingPower: number;
  votesCount: number;
  globalRank: number;
  achievements: string[];
  votedProposals: string[];
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
