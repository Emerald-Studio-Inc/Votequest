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
  // Optimized: Single query with nested select (eliminates N+1 problem)
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      proposal_options (
        id,
        proposal_id,
        option_number,
        title,
        description,
        allocation,
        votes,
        created_at
      )
    `)
    .eq('status', 'active')
    .gt('end_date', new Date().toISOString())  // Only proposals that haven't ended
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
    return []
  }

  // Rename nested field for consistency
  return (data || []).map(proposal => ({
    ...proposal,
    options: proposal.proposal_options || [],
    proposal_options: undefined
  })).filter(p => p.options && p.options.length > 0)
}

export async function getProposalWithOptions(proposalId: string) {
  // Optimized: Single query with nested select
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      proposal_options (*)
    `)
    .eq('id', proposalId)
    .single()

  if (error) {
    console.error('Error fetching proposal:', error)
    return null
  }

  if (!data) return null

  // Rename nested field for consistency
  return {
    ...data,
    options: data.proposal_options || [],
    proposal_options: undefined
  }
}

// Vote Functions
export async function castVote(
  userId: string,
  proposalId: string,
  optionId: string,
  txHash?: string,
  walletAddress?: string,
  captchaToken?: string
): Promise<boolean> {
  // Note: txHash and walletAddress are optional for database-only votes
  // Blockchain votes will provide both, Supabase-only votes will not

  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        proposalId,
        optionId,
        txHash: txHash || null,
        walletAddress: walletAddress || null,
        captchaToken: captchaToken || null
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

// NEW: Simplified proposal creation (no blockchain)
export async function createProposalSimple(
  title: string,
  description: string,
  endDate: string,
  options: { title: string; description?: string }[],
  userId: string,
  category?: string
): Promise<{ success: boolean; proposalId?: string; error?: string }> {
  try {
    const response = await fetch('/api/proposal/create-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        endDate,
        options,
        userId,
        category
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error creating proposal:', result);
      return { success: false, error: result.error || 'Failed to create proposal' };
    }

    return { success: true, proposalId: result.proposalId };
  } catch (error) {
    console.error('Error creating proposal:', error);
    return { success: false, error: 'Network error' };
  }
}

// OLD: Blockchain-based proposal creation (deprecated for now)
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

// Analytics functions (stubs - AnalyticsScreen uses mock data)
export async function getUserVotingHistory(userId: string) {
  const { data, error } = await supabase
    .from('votes')
    .select(`
      *,
      proposal:proposals(id, title, status, end_date),
      option:proposal_options(id, title)
    `)
    .eq('user_id', userId)
    .order('voted_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching voting history:', error)
    return []
  }
  return data || []
}

export async function getUserCategoryBreakdown(userId: string) {
  const { data, error } = await supabase
    .from('votes')
    .select(`
      proposal:proposals(category)
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching category breakdown:', error)
    return []
  }

  // Count votes by category
  const categoryCount: Record<string, number> = {}
  data?.forEach((vote: any) => {
    const category = vote.proposal?.category || 'Other'
    categoryCount[category] = (categoryCount[category] || 0) + 1
  })

  // Convert to array format
  return Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
    percentage: data.length > 0 ? Math.round((value / data.length) * 100) : 0
  }))
}

export async function getUserVotingActivity(userId: string, days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('votes')
    .select('voted_at')
    .eq('user_id', userId)
    .gte('voted_at', startDate.toISOString())

  if (error) {
    console.error('Error fetching voting activity:', error)
    return []
  }

  // Create array for all 7 days with 0 votes
  const activityByDate: Record<string, number> = {}

  // Initialize all days with 0 votes
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    activityByDate[dateStr] = 0
  }

  // Count actual votes
  data?.forEach((vote: any) => {
    const dateStr = new Date(vote.voted_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    if (activityByDate.hasOwnProperty(dateStr)) {
      activityByDate[dateStr]++
    }
  })

  // Return in chronological order
  return Object.entries(activityByDate)
    .map(([date, votes]) => ({ date, votes }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
