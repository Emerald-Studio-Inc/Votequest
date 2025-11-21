'use client'

import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, BarChart2, Settings, Plus, ArrowLeft, Check, X } from 'lucide-react';
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
import ProposalsListScreen from './ProposalsListScreen';
import AnalyticsScreen from './AnalyticsScreen';
import SettingsScreen from './SettingsScreen';
import Tooltip from './Tooltip';

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
  const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'proposals' | 'analytics' | 'settings'>('overview');
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

  const [pendingAction, setPendingAction] = useState<'vote' | 'create' | null>(null);

  const { address, isConnected } = useAccount();

  // Contract Hooks
  const { data: proposalCount } = useReadContract({
    address: VOTE_QUEST_ADDRESS,
    abi: VOTE_QUEST_ABI,
    functionName: 'proposalCount',
  });

  const proposalIds = proposalCount ? Array.from({ length: Number(proposalCount) }, (_, i) => BigInt(i + 1)) : [];

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
    if (isConfirmed) {
      if (pendingAction === 'vote' && selectedProposal && selectedOption && userData.userId) {
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
          setPendingAction(null);
          setTimeout(() => {
            setSelectedOption(null);
            setCurrentScreen('dashboard');
          }, 1500);
        };
        finishVote();
      } else if (pendingAction === 'create') {
        refetchProposals();
        setLoading(false);
        setPendingAction(null);
        setCurrentScreen('dashboard');
        // Optional: Award XP for creating a proposal if desired
      }
    }
  }, [isConfirmed, pendingAction]);

  // Handle write error
  useEffect(() => {
    if (writeError) {
      console.error("Transaction error:", writeError);
      setLoading(false);
      setPendingAction(null);
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
    setPendingAction('vote');
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
      setPendingAction(null);
    }
  };

  const handleCreateProposal = async (data: any) => {
    if (!userData.userId) return;

    setLoading(true);
    setPendingAction('create');
    try {
      const durationInMinutes = Math.max(1, Math.floor((new Date(data.end_date).getTime() - Date.now()) / (1000 * 60)));
      const optionTitles = data.options.map((o: any) => o.title);

      writeContract({
        address: VOTE_QUEST_ADDRESS,
        abi: VOTE_QUEST_ABI,
        functionName: 'createProposal',
        args: [
          data.title,
          data.description,
          BigInt(durationInMinutes),
          optionTitles
        ],
      });
    } catch (error) {
      console.error('Error creating proposal:', error);
      setLoading(false);
      setPendingAction(null);
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
      <>
        {activeDashboardTab === 'overview' && (
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
            activeTab={activeDashboardTab}
            onTabChange={setActiveDashboardTab}
            animations={animations}
          />
        )}
        {activeDashboardTab === 'proposals' && (
          <ProposalsListScreen
            proposals={proposals}
            onSelectProposal={(proposal) => {
              setSelectedProposal(proposal);
              setCurrentScreen('proposal');
            }}
            hasVoted={hasVoted}
          />
        )}
        {activeDashboardTab === 'analytics' && (
          <AnalyticsScreen
            userData={userData}
            proposals={proposals}
          />
        )}
        {activeDashboardTab === 'settings' && (
          <SettingsScreen
            userData={userData}
          />
        )}

        {/* Bottom Navigation - Shared across all tabs */}
        {/* Floating Bottom Navigation */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="glass rounded-2xl p-2 flex items-center justify-between shadow-2xl shadow-black/50 backdrop-blur-xl border border-white/10">
            {[
              { label: 'Overview', value: 'overview' as const, icon: LayoutGrid },
              { label: 'Proposals', value: 'proposals' as const, icon: List },
              { label: 'Analytics', value: 'analytics' as const, icon: BarChart2 },
              { label: 'Settings', value: 'settings' as const, icon: Settings }
            ].map((item) => {
              const isActive = activeDashboardTab === item.value;
              return (
                <Tooltip key={item.value} content={item.label} position="top">
                  <button
                    onClick={() => setActiveDashboardTab(item.value)}
                    className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} strokeWidth={isActive ? 2 : 1.5} />
                    {isActive && (
                      <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-fade-in"></span>
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </>
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
