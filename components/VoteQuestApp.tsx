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
import Skeleton from './Skeleton';

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
    level: 0,
    xp: 0,
    nextLevelXP: 100,
    streak: 0,
    votingPower: 0,
    votesCount: 0,
    globalRank: 0,
    achievements: [],
    votedProposals: [],
    coins: 0
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
    setAnimations((prev: Record<string, boolean>) => ({ ...prev, [key]: true }));
    setTimeout(() => setAnimations((prev: Record<string, boolean>) => ({ ...prev, [key]: false })), 500);
  };

  const [pendingAction, setPendingAction] = useState<'vote' | 'create' | null>(null);
  const [pendingProposalData, setPendingProposalData] = useState<any>(null);

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

  // Sync proposals from contract or Supabase (fallback)
  useEffect(() => {
    const fetchProposals = async () => {
      // Try contract first
      if (proposalsData && proposalsData.length > 0) {
        const formattedProposals = proposalsData.map((result: any) => {
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
        }).filter((p: any): p is ProposalWithOptions => p !== null);

        setProposals(formattedProposals);
      } else {
        // Fallback to Supabase if no contract data
        const supabaseProposals = await getActiveProposals();
        setProposals(supabaseProposals);
      }
    };

    fetchProposals();
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
            selectedOption,
            hash, // Pass transaction hash
            userData.address! // Pass wallet address
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

              setUserData((prev: any) => ({
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
      } else if (pendingAction === 'create' && pendingProposalData && userData.userId) {
        const finishCreate = async () => {
          await createProposal(
            pendingProposalData.title,
            pendingProposalData.description,
            pendingProposalData.end_date,
            pendingProposalData.options,
            userData.userId!,
            userData.address!,
            hash
          );

          refetchProposals();
          setLoading(false);
          setPendingAction(null);
          setPendingProposalData(null);
          setCurrentScreen('dashboard');
        };
        finishCreate();
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
            const nextLevelXP = Math.pow(user.level + 1, 2) * 100; // Formula: (level+1)^2 * 100
            setUserData({
              address: user.wallet_address,
              userId: user.id,
              level: user.level,
              xp: user.xp,
              nextLevelXP: nextLevelXP,
              streak: user.streak,
              votingPower: user.voting_power,
              votesCount: user.votes_count,
              globalRank: user.global_rank,
              achievements: myAchievements.map((a: any) => a.achievement_id),
              votedProposals: votedProposals,
              coins: user.coins || 0
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
          level: 0,
          xp: 0,
          nextLevelXP: 100,
          streak: 0,
          votingPower: 0,
          votesCount: 0,
          globalRank: 0,
          achievements: [],
          votedProposals: [],
          coins: 0
        });
        setCurrentScreen('login');
      }
    };

    syncUser();
  }, [isConnected, address]);

  const castVote = async () => {
    if (!selectedOption || !selectedProposal || !userData.userId) return;

    // Find option
    const option = selectedProposal.options.find((o: any) => o.id === selectedOption);
    if (!option) return;

    setLoading(true);
    try {
      console.log('[DEBUG] Casting vote...', { proposalId: selectedProposal.id, optionId: selectedOption });

      // Call vote API directly
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.userId,
          proposalId: selectedProposal.id,
          optionId: selectedOption,
          walletAddress: userData.address
        }),
      });

      const result = await response.json();
      console.log('[DEBUG] Vote response:', result);

      if (response.ok) {
        // Success! Update proposals and user data
        const { getActiveProposals, getUserByWallet } = await import('@/lib/database');
        const supabaseProposals = await getActiveProposals();
        setProposals(supabaseProposals);

        // Update user data
        if (userData.address) {
          const updatedUser = await getUserByWallet(userData.address);
          if (updatedUser) {
            const votedProposals = await getUserVotedProposals(updatedUser.id);
            setUserData((prev: any) => ({
              ...prev,
              xp: updatedUser.xp,
              level: updatedUser.level,
              votesCount: updatedUser.votes_count,
              coins: updatedUser.coins || 0,
              votedProposals: votedProposals
            }));
          }
        }

        alert('Vote cast successfully! You earned 10 VQC and 250 XP!');
        setSelectedOption(null);
        setCurrentScreen('dashboard');
      } else {
        console.error('[ERROR] Vote failed:', result);
        alert(`Failed to cast vote: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[ERROR] Vote exception:', error);
      alert('Failed to cast vote. Please try again.');
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const handleCreateProposal = async (data: any) => {
    if (!userData.userId) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setPendingAction('create');
    let blockchainTxHash: string | undefined;

    try {
      console.log('[DEBUG] Creating proposal...', data);

      // Attempt blockchain proposal creation if wallet is connected
      if (isConnected && address) {
        console.log('[BLOCKCHAIN] Attempting blockchain proposal creation...');

        try {
          const { attemptBlockchainProposalCreation } = await import('@/lib/blockchain-vote');

          // Calculate duration in minutes from end date
          const durationMinutes = Math.floor(
            (new Date(data.end_date).getTime() - Date.now()) / (1000 * 60)
          );

          const blockchainResult = await attemptBlockchainProposalCreation(
            data.title,
            data.description || '',
            durationMinutes,
            data.options.map((opt: any) => opt.title),
            isConnected,
            address
          );

          if (blockchainResult.success && blockchainResult.txHash) {
            console.log('[BLOCKCHAIN] Proposal creation transaction:', blockchainResult.txHash);
            blockchainTxHash = blockchainResult.txHash;
          } else {
            console.log('[BLOCKCHAIN] Failed, falling back to database:', blockchainResult.error);
          }
        } catch (blockchainError: any) {
          console.warn('[BLOCKCHAIN] Error during blockchain creation:', blockchainError.message);
        }
      }

      // Create proposal in database (with or without blockchain tx hash)
      console.log('[DATABASE] Creating proposal in Supabase...');

      // Call the simple API endpoint directly
      const response = await fetch('/api/proposal/create-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description || '',
          endDate: data.end_date,
          options: data.options,
          userId: userData.userId,
          category: data.category || 'Community',
          txHash: blockchainTxHash || null,
          walletAddress: address || null
        }),
      });

      const result = await response.json();
      console.log('[DEBUG] API response:', result);

      if (response.ok && result.success) {
        // Success! Refetch proposals
        const { getActiveProposals, getUserByWallet } = await import('@/lib/database');
        const supabaseProposals = await getActiveProposals();
        setProposals(supabaseProposals);

        // Update user coins
        if (userData.address) {
          const updatedUser = await getUserByWallet(userData.address);
          if (updatedUser) {
            setUserData((prev: any) => ({
              ...prev,
              coins: updatedUser.coins || 0
            }));
          }
        }

        alert('Proposal created successfully! You earned 50 VQC!');
        setCurrentScreen('dashboard');
      } else {
        console.error('[ERROR] Failed:', result);
        alert(`Failed to create proposal: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[ERROR] Exception:', error);
      alert('Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
      setPendingAction(null);
      setPendingProposalData(null);
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
            onSelectProposal={(proposal: any) => {
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
            onSelectProposal={(proposal: any) => {
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
        )
        }
        {
          activeDashboardTab === 'settings' && (
            <SettingsScreen
              userData={userData}
            />
          )
        }

        {/* Bottom Navigation - Shared across all tabs */}
        {/* Floating Bottom Navigation */}
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="glass rounded-2xl p-2 flex items-center justify-between shadow-2xl shadow-black/50 backdrop-blur-xl border border-white/10 w-auto">\
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
