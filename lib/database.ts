import { supabase } from './supabase'
import type { User, Proposal } from './supabase'

// User Functions
export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error)
    return null
  }
  return data
}

export async function createUser(walletAddress: string): Promise<User | null> {
  try {
    const response = await fetch('/api/user/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) throw new Error('Failed to create user');

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUserXP(userId: string, xpGained: number): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', userId)
    .single()

  if (!user) return false

  const newXP = user.xp + xpGained
  const newLevel = Math.floor(Math.sqrt(newXP / 100))

  const { error } = await supabase
    .from('users')
    .update({
      xp: newXP,
      level: newLevel,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user XP:', error)
    return false
  }

  return true
}

// Proposal Functions
export async function getActiveProposals() {
  const { data: proposals, error: propError } = await supabase
    .from('proposals')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (propError) {
    console.error('Error fetching proposals:', propError)
    return []
  }

  // Get options for each proposal
  const proposalsWithOptions = await Promise.all(
    (proposals || []).map(async (proposal: Proposal) => {
      const { data: options } = await supabase
        .from('proposal_options')
        .select('*')
        .eq('proposal_id', proposal.id)
        .order('option_number')

      return {
        ...proposal,
        options: options || []
      }
    })
  )

  return proposalsWithOptions
}

export async function getProposalWithOptions(proposalId: string) {
  const { data: proposal, error: propError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .single()

  if (propError) {
    console.error('Error fetching proposal:', propError)
    return null
  }

  const { data: options, error: optError } = await supabase
    .from('proposal_options')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('option_number')

  if (optError) {
    console.error('Error fetching options:', optError)
    return null
  }

  return { ...proposal, options }
}

// Vote Functions
export async function castVote(
  userId: string,
  proposalId: string,
  optionId: string,
  txHash?: string,
  walletAddress?: string
): Promise<boolean> {
  if (!txHash || !walletAddress) {
    console.error('Missing txHash or walletAddress for secure vote');
    return false;
  }

  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        proposalId,
        optionId,
        txHash,
        walletAddress
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error casting vote:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error casting vote:', error);
    return false;
  }
}

export async function getUserVotedProposals(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('votes')
    .select('proposal_id')
    .eq('user_id', userId)

  return data?.map((v: { proposal_id: string }) => v.proposal_id) || []
}

export async function createProposal(
  title: string,
  description: string,
  endDate: string,
  options: { title: string; description: string }[],
  creatorId: string,
  walletAddress?: string,
  txHash?: string
): Promise<boolean> {
  if (!walletAddress || !txHash) {
    console.error('Missing walletAddress or txHash for secure proposal creation');
    return false;
  }

  try {
    const response = await fetch('/api/proposal/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        endDate,
        options,
        creatorId,
        walletAddress,
        txHash
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error creating proposal:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating proposal:', error);
    return false;
  }
}
// Achievement Functions
export async function getAchievements() {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('xp_reward', { ascending: true })

  if (error) {
    console.error('Error fetching achievements:', error)
    return []
  }
  return data
}

export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievement:achievements(*)')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user achievements:', error)
    return []
  }
  return data
}

export async function checkAndAwardAchievements(userId: string) {
  try {
    const response = await fetch('/api/achievements/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.hasNewAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return false;
  }
}
