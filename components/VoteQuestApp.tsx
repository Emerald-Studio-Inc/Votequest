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
import { useAutoReload } from '@/hooks/useAutoReload';
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
import VoteCaptcha from './VoteCaptcha';

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
  coins: number;
}

const VoteQuestApp = () => {
  // Always start with 'splash' to avoid hydration mismatch
  // We'll check for returning users in useEffect
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
  const [pendingAction, setPendingAction] = useState<'vote' | 'create' | null>(null);
  const [pendingProposalData, setPendingProposalData] = useState<any>(null);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  // Hooks must come before effects that use them
  const { address, isConnected } = useAccount();

  // Auto-reload on new deployment (production only)
  useAutoReload();

  // Load achievements from database on mount
  useEffect(() => {
    loadAchievements();
  }, []);

  // Check for returning user (client-side only, after mount)
  useEffect(() => {
    if (currentScreen === 'splash') {
      const hasVisited = localStorage.getItem('votequest_visited');
      if (hasVisited) {
        // Skip splash for returning users
        setCurrentScreen('checking');
      }
    }
  }, []);

  const loadAchievements = async () => {
    const data = await getAchievements();
    setAchievements(data);
  };


  // Check for wallet auto-reconnect on mount
  useEffect(() => {
    if (currentScreen === 'checking') {
      // Give wagmi a moment to auto-reconnect
      const timer = setTimeout(() => {
        if (isConnected && address) {
          // Wallet is connected, go to dashboard
          setCurrentScreen('dashboard');
        } else {
          // No wallet connected, go to login
          setCurrentScreen('login');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, isConnected, address]);

  // Handle referral links from QR codes / share links
  useEffect(() => {
    if (currentScreen === 'dashboard' && proposals.length > 0) {
      const targetProposalId = localStorage.getItem('targetProposalId');
      const referralCode = localStorage.getItem('referralCode');

      if (targetProposalId) {
        // Find the proposal
        const proposal = proposals.find(p => p.id === targetProposalId);

        if (proposal) {
          console.log('[REFERRAL] Auto-navigating to proposal:', targetProposalId);

          // Track the referral click
          if (referralCode) {
            fetch('/api/share/track-click', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ referralCode })
            }).catch(err => console.error('Failed to track click:', err));
          }

          // Navigate to the proposal
          setSelectedProposal(proposal);
          setCurrentScreen('proposal');

          // Clear localStorage
          localStorage.removeItem('targetProposalId');
          localStorage.removeItem('referralCode');
        }
      }
    }
  }, [currentScreen, proposals]);

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

      // Auto-sync all blockchain proposals to database (non-blocking)
      formattedProposals.forEach(async (proposal) => {
        try {
          await fetch('/api/proposal/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blockchainId: parseInt(proposal.id),
              title: proposal.title,
              description: proposal.description,
              endDate: proposal.end_date,
              status: proposal.status,
              participants: proposal.participants,
              options: proposal.options.map(opt => ({
                title: opt.title,
                description: opt.description,
                votes: opt.votes
              }))
            })
          });
        } catch (error) {
          console.error(`Failed to sync proposal ${proposal.id} to database:`, error);
          // Don't block UI on sync errors
        }
      });
    }
  }, [proposalsData]);

  // REAL-TIME: Listen for new proposals in database → trigger blockchain refetch
  useEffect(() => {
    console.log('[REALTIME] Setting up proposal subscription...');

    const channel = supabase
      .channel('proposals-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'proposals'
        },
        (payload) => {
          console.log('[REALTIME] ✅ New proposal detected!', payload.new);
          // Trigger blockchain refetch to show new proposal
          refetchProposals();
        }
      )
      .subscribe();

    return () => {
      console.log('[REALTIME] Cleaning up proposal subscription');
      supabase.removeChannel(channel);
    };
  }, [refetchProposals]);

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
            hash,
            userData.address!,
            captchaToken
          );

          // Reset CAPTCHA after successful vote
          setCaptchaToken('');

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
                coins: updatedUser.coins || 0,  // ADD THIS - critical for showing coin increments
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
      } else if (pendingAction === 'create' && pendingProposalData && userData.userId && userData.address && hash) {
        const syncProposalToDB = async () => {
          try {
            // Sync proposal to database
            const response = await fetch('/api/proposal/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: pendingProposalData.title,
                description: pendingProposalData.description,
                endDate: pendingProposalData.end_date,
                options: pendingProposalData.options,
                creatorId: userData.userId,
                walletAddress: userData.address,
                txHash: hash,
                category: 'Community'
              }),
            });

            if (response.ok) {
              console.log('Proposal synced to database successfully');
              // Reload user data to get updated coins (50 VQC reward)
              if (userData.address) {
                const updatedUser = await getUserByWallet(userData.address);
                if (updatedUser) {
                  setUserData(prev => ({
                    ...prev,
                    coins: updatedUser.coins || 0
                  }));
                }
              }
            } else {
              const errorData = await response.json();
              console.error('Failed to sync proposal to database:', errorData);
            }
          } catch (error) {
            console.error('Error syncing proposal to database:', error);
          }

          refetchProposals();
          setLoading(false);
          setPendingAction(null);
          setPendingProposalData(null);
          setCurrentScreen('dashboard');
        };
        syncProposalToDB();
      } else if (pendingAction === 'create') {
        // Fallback: just refetch proposals if we don't have the data
        refetchProposals();
        setLoading(false);
        setPendingAction(null);
        setPendingProposalData(null);
        setCurrentScreen('dashboard');
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
              votedProposals: votedProposals,
              coins: user.coins || 0
            });

            if (currentScreen === 'login') {
              localStorage.setItem('votequest_visited', 'true');
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

    // Require CAPTCHA - with fallback
    if (!captchaToken) {
      console.warn('⚠️ Please complete the security check before voting');
      alert('Please complete the security verification to vote');
      return;
    }

    // Find option index
    const option = selectedProposal.options.find(o => o.id === selectedOption);
    if (!option) return;

    setLoading(true);
    setPendingAction('vote');
    try {
      // CRITICAL: Use blockchain_id, not database UUID!
      const blockchain_id = (selectedProposal as any).blockchain_id;
      if (!blockchain_id) {
        throw new Error('This proposal has no blockchain ID - can only vote via database');
      }

      writeContract({
        address: VOTE_QUEST_ADDRESS,
        abi: VOTE_QUEST_ABI,
        functionName: 'vote',
        args: [BigInt(blockchain_id), BigInt(option.option_number)], // USE blockchain_id, NOT selectedProposal.id!
      });
    } catch (error) {
      console.error('Error casting vote:', error);
      setLoading(false);
      setPendingAction(null);

      // Fallback: vote in database only
      alert('Blockchain vote failed. Voting in database only...');
      // Could call dbCastVote here as fallback
    }
  };

  const handleCreateProposal = async (data: any) => {
    if (!userData.userId) return;

    setLoading(true);
    setPendingAction('create');
    setPendingProposalData(data); // Store for later sync to DB
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
      setPendingProposalData(null);
    }
  };

  const hasVoted = (proposalId: string) => {
    return userData.votedProposals.includes(proposalId);
  };

  // Render based on current screen
  if (currentScreen === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-mono-60 text-sm">Connecting...</p>
        </div>
      </div>
    );
  }

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
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="glass rounded-2xl p-2 flex items-center justify-between shadow-2xl shadow-black/50 backdrop-blur-xl border border-white/10 w-full max-w-sm">
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
        userId={userData.userId || ''}
        captchaToken={captchaToken}
        setCaptchaToken={setCaptchaToken}
      />
    );
  }

  return null;
};

export default VoteQuestApp;
