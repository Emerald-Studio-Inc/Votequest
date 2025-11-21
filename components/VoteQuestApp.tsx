'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'
import type { ProposalWithOptions, Achievement, UserAchievement } from '@/lib/supabase'
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VOTE_QUEST_ADDRESS, VOTE_QUEST_ABI } from '@/lib/contracts';
import {
  getUserByWallet,
  createUser,
  getActiveProposals,
  castVote as dbCastVote,
  getUserVotedProposals,
  createProposal,
  getAchievements,
  getUserAchievements,
  checkAndAwardAchievements
} from '@/lib/database'
import SplashScreen from './SplashScreen';
import OnboardingScreen from './OnboardingScreen';
import LoginScreen from './LoginScreen';
import DashboardScreen from './DashboardScreen';
import ProposalDetailScreen from './ProposalDetailScreen';
import CreateProposalScreen from './CreateProposalScreen';

interface UserData {
  address: string | null;
  userId: string | null;
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

const VoteQuestApp = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [userData, setUserData] = useState<UserData>({
    address: null,
    userId: null,
    level: 5,
    xp: 3420,
    nextLevelXP: 5000,
    streak: 12,
    votingPower: 2847,
    votesCount: 47,
    globalRank: 247,
    achievements: ['first_vote', 'week_streak', 'level_5'],
    votedProposals: []
  });
  const [selectedProposal, setSelectedProposal] = useState<ProposalWithOptions | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ProposalWithOptions[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [animations, setAnimations] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Load achievements from database on mount
  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const data = await getAchievements();
    setAchievements(data);
  };

  // Splash screen timer
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('onboarding1'), 1800);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const triggerAnimation = (key: string) => {
    setAnimations(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setAnimations(prev => ({ ...prev, [key]: false })), 500);
  };

  const { address, isConnected } = useAccount();

  // Contract Hooks
  const { data: proposalCount } = useReadContract({
    address: VOTE_QUEST_ADDRESS,
    abi: VOTE_QUEST_ABI,
    functionName: 'proposalCount',
  });

  const proposalIds = proposalCount ? Array.from({ length: Number(proposalCount) }, (_, i) => BigInt(i)) : [];

  const { data: proposalsData, refetch: refetchProposals } = useReadContracts({
    contracts: proposalIds.map(id => ({
      address: VOTE_QUEST_ADDRESS,
      abi: VOTE_QUEST_ABI,
      functionName: 'getProposal',
      args: [id]
    }))
  });

  const { writeContract, data: hash, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Sync proposals from contract
  useEffect(() => {
    if (proposalsData) {
      const formattedProposals = proposalsData.map((result) => {
        if (result.status === 'success' && result.result) {
          const p = result.result as any;
          const totalVotes = p.voteCounts.reduce((a: number, b: bigint) => a + Number(b), 0);
          return {
            id: p.id.toString(),
            title: p.title,
            description: p.description,
            status: (Date.now() < Number(p.deadline) * 1000 ? 'active' : 'closed') as 'active' | 'closed' | 'pending',
            participants: totalVotes,
            end_date: new Date(Number(p.deadline) * 1000).toISOString(),
            created_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            options: p.options.map((opt: string, idx: number) => ({
              id: `${p.id}-${idx}`,
              proposal_id: p.id.toString(),
              option_number: idx,
              title: opt,
              description: null,
              allocation: null,
              percentage: totalVotes > 0 ? Math.round((Number(p.voteCounts[idx]) / totalVotes) * 100).toString() : '0',
              votes: Number(p.voteCounts[idx]),
              created_at: new Date().toISOString()
            }))
          } as ProposalWithOptions;
        }
        return null;
      }).filter((p): p is ProposalWithOptions => p !== null);

      setProposals(formattedProposals);
    }
  }, [proposalsData]);

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && selectedProposal && selectedOption && userData.userId) {
      const finishVote = async () => {
        // Record in DB for gamification
        await dbCastVote(
          userData.userId!,
          selectedProposal.id,
          selectedOption
        );

        // Reload user data
        if (userData.address) {
          const updatedUser = await getUserByWallet(userData.address);
          if (updatedUser) {
            const votedProposals = await getUserVotedProposals(updatedUser.id);
            const hasNewAchievements = await checkAndAwardAchievements(updatedUser.id);

            if (hasNewAchievements) {
              const updatedAchievements = await getUserAchievements(updatedUser.id);
              setUserAchievements(updatedAchievements);
              triggerAnimation('achievementUnlocked');
            }

            setUserData(prev => ({
              ...prev,
              xp: updatedUser.xp,
              level: updatedUser.level,
              votesCount: updatedUser.votes_count,
              votingPower: updatedUser.voting_power,
              votedProposals: votedProposals
            }));
          }
        }

        refetchProposals();
        triggerAnimation('voteSuccess');
        setLoading(false);
        setTimeout(() => {
          setSelectedOption(null);
          setCurrentScreen('dashboard');
        }, 1500);
      };
      finishVote();
    }
  }, [isConfirmed]);

  // Handle write error
  useEffect(() => {
    if (writeError) {
      console.error("Vote error:", writeError);
      setLoading(false);
    }
  }, [writeError]);

  // Handle wallet connection and user data syncing
  useEffect(() => {
    const syncUser = async () => {
      if (isConnected && address) {
        setLoading(true);
        try {
          // Check if user exists in database
          let user = await getUserByWallet(address);

          // If not, create new user
          if (!user) {
            user = await createUser(address);
          }

          if (user) {
            // Load user's voted proposals
            const votedProposals = await getUserVotedProposals(user.id);
            const myAchievements = await getUserAchievements(user.id);
            setUserAchievements(myAchievements);

            // Set user data
            setUserData({
              address: user.wallet_address,
              userId: user.id,
              level: user.level,
              xp: user.xp,
              nextLevelXP: 5000,
              streak: user.streak,
              votingPower: user.voting_power,
              votesCount: user.votes_count,
              globalRank: user.global_rank,
              achievements: ['first_vote', 'week_streak', 'level_5'],
              votedProposals: votedProposals
            });

            if (currentScreen === 'login') {
              setCurrentScreen('dashboard');
              triggerAnimation('walletConnected');
            }
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        } finally {
          setLoading(false);
        }
      } else if (!isConnected && currentScreen !== 'splash' && !currentScreen.startsWith('onboarding')) {
        // Handle disconnect
        setUserData({
          address: null,
          userId: null,
          level: 5,
          xp: 3420,
          nextLevelXP: 5000,
          streak: 12,
          votingPower: 2847,
          votesCount: 47,
          globalRank: 247,
          achievements: [],
          votedProposals: []
        });
        setCurrentScreen('login');
      }
    };

    syncUser();
  }, [isConnected, address]);

  const castVote = async () => {
    if (!selectedOption || !selectedProposal || !userData.userId) return;

    // Find option index
    const option = selectedProposal.options.find(o => o.id === selectedOption);
    if (!option) return;

    setLoading(true);
    try {
      writeContract({
        address: VOTE_QUEST_ADDRESS,
        abi: VOTE_QUEST_ABI,
        functionName: 'vote',
        args: [BigInt(selectedProposal.id), BigInt(option.option_number)],
      });
    } catch (error) {
      console.error('Error casting vote:', error);
      setLoading(false);
    }
  };

  const handleCreateProposal = async (data: any) => {
    if (!userData.userId) return;

    setLoading(true);
    try {
      const success = await createProposal(
        data.title,
        data.description,
        data.end_date,
        data.options,
        userData.userId
      );

      if (success) {
        refetchProposals();

        // Check for new achievements
        const hasNewAchievements = await checkAndAwardAchievements(userData.userId);
        if (hasNewAchievements) {
          const updatedAchievements = await getUserAchievements(userData.userId);
          setUserAchievements(updatedAchievements);
        }

        setCurrentScreen('dashboard');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasVoted = (proposalId: string) => {
    return userData.votedProposals.includes(proposalId);
  };

  // Render based on current screen
  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  if (currentScreen.startsWith('onboarding')) {
    return <OnboardingScreen currentScreen={currentScreen} onNext={setCurrentScreen} />;
  }

  if (currentScreen === 'login') {
    return <LoginScreen loading={loading} />;
  }

  if (currentScreen === 'dashboard') {
    return (
      <DashboardScreen
        userData={userData}
        proposals={proposals}
        achievements={achievements}
        userAchievements={userAchievements}
        onSelectProposal={(proposal) => {
          setSelectedProposal(proposal);
          setCurrentScreen('proposal');
        }}
        onNavigate={setCurrentScreen}
        animations={animations}
      />
    );
  }

  if (currentScreen === 'create-proposal') {
    return (
      <CreateProposalScreen
        onBack={() => setCurrentScreen('dashboard')}
        onSubmit={handleCreateProposal}
        loading={loading}
      />
    );
  }

  if (currentScreen === 'proposal' && selectedProposal) {
    return (
      <ProposalDetailScreen
        proposal={selectedProposal}
        onBack={() => {
          setCurrentScreen('dashboard');
          setSelectedOption(null);
        }}
        onVote={castVote}
        loading={loading}
        hasVoted={hasVoted(selectedProposal.id)}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
      />
    );
  }

  return null;
};

export default VoteQuestApp;
