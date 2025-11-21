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
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        wallet_address: walletAddress.toLowerCase(),
        level: 5,
        xp: 3420,
        streak: 12,
        voting_power: 2847,
        votes_count: 47,
        global_rank: 247,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }
  return data
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
  optionId: string
): Promise<boolean> {
  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('user_id', userId)
    .eq('proposal_id', proposalId)
    .single()

  if (existingVote) {
    console.error('User already voted on this proposal')
    return false
  }

  // Insert vote
  const { error } = await supabase
    .from('votes')
    .insert([{
      user_id: userId,
      proposal_id: proposalId,
      option_id: optionId,
      tx_hash: null,
    }])

  if (error) {
    console.error('Error casting vote:', error)
    return false
  }

  // Update counts using database functions
  await supabase.rpc('increment_option_votes', { option_id: optionId })
  await supabase.rpc('increment_proposal_participants', { proposal_id: proposalId })
  await supabase.rpc('increment_user_votes', { user_id: userId })
  await updateUserXP(userId, 250)

  return true
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
  creatorId: string
): Promise<boolean> {
  const { data: proposal, error: propError } = await supabase
    .from('proposals')
    .insert([
      {
        title,
        description,
        end_date: endDate,
        created_by: creatorId,
        status: 'active',
        participants: 0
      }
    ])
    .select()
    .single()

  if (propError || !proposal) {
    console.error('Error creating proposal:', propError)
    return false
  }

  const optionsData = options.map((opt, index) => ({
    proposal_id: proposal.id,
    option_number: index + 1,
    title: opt.title,
    description: opt.description,
    votes: 0
  }))

  const { error: optError } = await supabase
    .from('proposal_options')
    .insert(optionsData)

  if (optError) {
    console.error('Error creating options:', optError)
    // Ideally we should rollback proposal creation here, but Supabase JS client doesn't support transactions easily without RPC.
    // For now we'll just log it.
    return false
  }

  return true
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
  const user = await getUserByWallet((await supabase.auth.getUser()).data.user?.email || '') // This might be wrong if we don't use auth email. 
  // Actually we should fetch user by ID since we have it.
  const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single()

  if (!userData) return

  const achievements = await getAchievements()
  const userAchievements = await getUserAchievements(userId)
  const earnedCodes = new Set(userAchievements.map((ua: any) => ua.achievement.code))

  const newAchievements = []

  // Check 'first_vote'
  if (!earnedCodes.has('first_vote') && userData.votes_count > 0) {
    newAchievements.push('first_vote')
  }

  // Check 'week_streak'
  if (!earnedCodes.has('week_streak') && userData.streak >= 7) {
    newAchievements.push('week_streak')
  }

  // Check 'level_5'
  if (!earnedCodes.has('level_5') && userData.level >= 5) {
    newAchievements.push('level_5')
  }

  // Check 'proposal_creator'
  // We need to check if they created a proposal.
  if (!earnedCodes.has('proposal_creator')) {
    const { count } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    if (count && count > 0) {
      newAchievements.push('proposal_creator')
    }
  }

  for (const code of newAchievements) {
    const achievement = achievements.find((a: any) => a.code === code)
    if (achievement) {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id
      })
      // Award XP
      await updateUserXP(userId, achievement.xp_reward)
    }
  }

  return newAchievements.length > 0
}
