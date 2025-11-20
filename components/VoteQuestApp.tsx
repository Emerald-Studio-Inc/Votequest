'use client'

import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, Check, Clock, Users, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase'
import { 
  getUserByWallet, 
  createUser, 
  getActiveProposals,
  castVote as dbCastVote,
  getUserVotedProposals 
} from '@/lib/database'

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

interface ProposalOption {
  id: string;
  option_number: number;
  title: string;
  description: string | null;
  allocation?: string | null;
  percentage?: string | null;
  votes: number;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  participants: number;
  end_date: string;
  status: string;
  options: ProposalOption[];
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
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [animations, setAnimations] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Load proposals from database on mount
  useEffect(() => {
    loadProposalsFromDB();
  }, []);

  // Splash screen timer
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('onboarding1'), 1800);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const loadProposalsFromDB = async () => {
    try {
      const data = await getActiveProposals();
      setProposals(data as any);
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  const triggerAnimation = (key: string) => {
    setAnimations(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setAnimations(prev => ({ ...prev, [key]: false })), 500);
  };

  const connectWallet = async (walletName: string) => {
    setLoading(true);
    try {
      // Simulate wallet connection - generate a mock address
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      
      // Check if user exists in database
      let user = await getUserByWallet(mockAddress);
      
      // If not, create new user
      if (!user) {
        user = await createUser(mockAddress);
      }

      if (user) {
        // Load user's voted proposals
        const votedProposals = await getUserVotedProposals(user.id);
        
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
        
        setCurrentScreen('dashboard');
        triggerAnimation('walletConnected');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const castVote = async () => {
    if (!selectedOption || !selectedProposal || !userData.userId) return;

    setLoading(true);
    try {
      // Save vote to database
      const success = await dbCastVote(
        userData.userId,
        selectedProposal.id,
        selectedOption
      );

      if (success) {
        // Reload proposals to get updated counts
        await loadProposalsFromDB();
        
        // Reload user data to get updated stats
        if (userData.address) {
          const updatedUser = await getUserByWallet(userData.address);
          if (updatedUser) {
            const votedProposals = await getUserVotedProposals(updatedUser.id);
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

        triggerAnimation('voteSuccess');
        setTimeout(() => {
          setSelectedOption(null);
          setCurrentScreen('dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateParticipation = (proposal: Proposal) => {
    const totalVotes = proposal.options.reduce((sum, opt) => sum + opt.votes, 0);
    return proposal.participants > 0 ? Math.round((totalVotes / proposal.participants) * 100) : 0;
  };

  const hasVoted = (proposalId: string) => {
    return userData.votedProposals.includes(proposalId);
  };

  const formatTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  const progressPercent = (userData.xp / userData.nextLevelXP) * 100;

  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-violet-600 rounded-full blur-[128px]"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute top-0 left-0 animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute top-0 right-0 animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute bottom-0 left-0 animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute bottom-0 right-0 animate-pulse" style={{animationDelay: '0.6s'}}></div>
              <div className="w-16 h-16 border-2 border-zinc-800"></div>
            </div>
          </div>
          <h1 className="text-5xl font-light text-white tracking-wider mb-2">VOTEQUEST</h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-zinc-700 to-transparent mx-auto mb-2"></div>
          <p className="text-zinc-500 text-sm tracking-widest uppercase">Decentralized Governance</p>
        </div>
      </div>
    );
  }

  // Onboarding
  const onboardingScreens = [
    {
      id: 'onboarding1',
      title: 'Cryptographic Security',
      description: 'Military-grade encryption with immutable blockchain records. Every transaction is cryptographically verified and permanently stored.',
      next: 'onboarding2'
    },
    {
      id: 'onboarding2',
      title: 'Merit-Based System',
      description: 'Build influence through consistent participation and quality contributions. Your reputation compounds over time.',
      next: 'onboarding3'
    },
    {
      id: 'onboarding3',
      title: 'Full Transparency',
      description: 'Complete visibility into all governance decisions. Track proposals, voting patterns, and outcomes in real-time.',
      next: 'login'
    }
  ];

  const currentOnboarding = onboardingScreens.find(s => s.id === currentScreen);

  if (currentOnboarding) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[128px]"></div>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-8 py-20 relative z-10">
          <div className="max-w-xl">
            <div className="mb-12">
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 mb-8"></div>
              <h2 className="text-4xl font-light text-white mb-6 tracking-tight leading-tight">{currentOnboarding.title}</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">{currentOnboarding.description}</p>
            </div>
          </div>
        </div>
        
        <div className="px-8 pb-12 relative z-10">
          <div className="flex gap-1 justify-center mb-8">
            {onboardingScreens.map(screen => (
              <div
                key={screen.id}
                className={`h-px transition-all duration-500 ${
                  screen.id === currentScreen
                    ? 'w-16 bg-white'
                    : 'w-8 bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentScreen(currentOnboarding.next)}
            className="w-full bg-white hover:bg-zinc-100 text-black py-4 rounded font-medium transition-colors flex items-center justify-center gap-2 group"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  // Login/Connect Wallet
  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col px-8 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600 rounded-full blur-[128px]"></div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10">
          <div className="mb-16">
            <h1 className="text-4xl font-light text-white mb-3 tracking-tight">Connect Wallet</h1>
            <p className="text-zinc-500">Authenticate using your Web3 wallet</p>
          </div>

          <div className="space-y-3">
            {[
              { name: 'MetaMask', desc: 'Browser extension wallet' },
              { name: 'WalletConnect', desc: 'Mobile wallet connection' },
              { name: 'Coinbase Wallet', desc: 'Custodial wallet service' }
            ].map((wallet, idx) => (
              <button
                key={idx}
                onClick={() => connectWallet(wallet.name)}
                disabled={loading}
                className="w-full bg-zinc-900/50 hover:bg-zinc-900 backdrop-blur-xl rounded border border-zinc-800 hover:border-zinc-700 p-5 flex items-center justify-between transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-left">
                  <div className="text-white font-medium mb-0.5">{wallet.name}</div>
                  <div className="text-sm text-zinc-500">{wallet.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" strokeWidth={2} />
              </button>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-zinc-600 text-sm">
              By connecting, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  if (currentScreen === 'dashboard') {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black pointer-events-none"></div>
        
        {/* Header */}
        <div className="relative z-10 border-b border-zinc-900">
          <div className="px-6 pt-16 pb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-light text-white tracking-tight mb-1">Portfolio</h1>
                <p className="text-zinc-500 text-sm">Governance Dashboard</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 text-sm font-mono">
                  Lv.{userData.level}
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 rounded overflow-hidden">
              {[
                { label: 'Power', value: userData.votingPower.toLocaleString() },
                { label: 'Votes', value: userData.votesCount },
                { label: 'Streak', value: `${userData.streak}d` },
                { label: 'Rank', value: `#${userData.globalRank}` }
              ].map((stat, idx) => (
                <div key={idx} className="bg-zinc-950 p-4">
                  <div className="text-zinc-500 text-xs mb-2 uppercase tracking-wider">{stat.label}</div>
                  <div className="text-white text-2xl font-light">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reputation Section */}
        <div className="relative z-10 border-b border-zinc-900">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Reputation</div>
                <div className="text-white text-2xl font-light">Level {userData.level}</div>
              </div>
              <div className="text-right">
                <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Progress</div>
                <div className="text-white text-2xl font-light">{Math.round(progressPercent)}%</div>
              </div>
            </div>
            <div className="relative h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-zinc-600 text-xs">
              {userData.nextLevelXP - userData.xp} XP remaining to Level {userData.level + 1}
            </div>
          </div>
        </div>

        {/* Active Proposals */}
        <div className="relative z-10 border-b border-zinc-900">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-light text-white">Active Proposals</h2>
              <button className="text-zinc-500 hover:text-white text-sm transition-colors flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
            
            <div className="space-y-3">
              {proposals.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  Loading proposals...
                </div>
              ) : (
                proposals.map((proposal) => {
                  const participation = calculateParticipation(proposal);
                  const voted = hasVoted(proposal.id);
                  
                  return (
                    <div 
                      key={proposal.id}
                      onClick={() => {
                        setSelectedProposal(proposal);
                        setCurrentScreen('proposal');
                      }}
                      className="bg-zinc-900/50 hover:bg-zinc-900 backdrop-blur-xl border border-zinc-800 hover:border-zinc-700 rounded p-5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-zinc-600 text-xs font-mono">{proposal.id}</div>
                            {voted && (
                              <div className="flex items-center gap-1 text-xs text-green-500">
                                <Check className="w-3 h-3" strokeWidth={2} />
                                <span>Voted</span>
                              </div>
                            )}
                          </div>
                          <div className="text-white font-light mb-3">{proposal.title}</div>
                          <div className="flex items-center gap-6 text-xs text-zinc-500">
                            <span className="flex items-center gap-2">
                              <Users className="w-3 h-3" strokeWidth={1.5} />
                              {proposal.participants.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-3 h-3" strokeWidth={1.5} />
                              {formatTimeLeft(proposal.end_date)}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all mt-1" strokeWidth={2} />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${participation}%` }} />
                        </div>
                        <div className="text-xs text-zinc-500 font-mono">{participation}%</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="relative z-10">
          <div className="px-6 py-8 pb-32">
            <h2 className="text-lg font-light text-white mb-6">Daily Objectives</h2>
            <div className="space-y-3">
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="text-white text-sm mb-0.5">Active Participation</div>
                      <div className="text-zinc-500 text-xs">Vote on 3 active proposals</div>
                    </div>
                  </div>
                  <div className="text-zinc-500 text-xs font-mono">{Math.min(userData.votedProposals.length, 3)}/3</div>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(Math.min(userData.votedProposals.length, 3) / 3) * 100}%` }} />
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <div className="text-white text-sm mb-0.5">Consistency Bonus</div>
                      <div className="text-zinc-500 text-xs">{userData.streak}-day active streak</div>
                    </div>
                  </div>
                  <div className="text-green-500 text-xs">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-900 z-20">
          <div className="px-6 py-4">
            <div className="flex justify-around items-center max-w-md mx-auto">
              {[
                { label: 'Overview', active: true },
                { label: 'Proposals', active: false },
                { label: 'Analytics', active: false },
                { label: 'Settings', active: false }
              ].map((item, idx) => (
                <button key={idx} className={`text-xs uppercase tracking-wider transition-colors ${item.active ? 'text-white' : 'text-zinc-600'}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {animations.voteSuccess && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
            <div className="bg-zinc-900 backdrop-blur-xl border border-zinc-800 rounded px-6 py-4 flex items-center gap-3 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div>
                <div className="text-white text-sm font-medium">Vote recorded successfully</div>
                <div className="text-zinc-500 text-xs">+250 XP earned</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Proposal Detail
  if (currentScreen === 'proposal' && selectedProposal) {
    const totalVotes = selectedProposal.options.reduce((sum, opt) => sum + opt.votes, 0);
    const hasVotedOnThis = hasVoted(selectedProposal.id);

    return (
      <div className="min-h-screen bg-zinc-950 pb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black pointer-events-none"></div>
        
        {/* Header */}
        <div className="relative z-10 border-b border-zinc-900">
          <div className="px-6 pt-16 pb-8">
            <button 
              onClick={() => {
                setCurrentScreen('dashboard');
                setSelectedOption(null);
              }}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm">Back</span>
            </button>
            
            <div className="text-zinc-600 text-xs font-mono mb-3">{selectedProposal.id}</div>
            <h1 className="text-3xl font-light text-white mb-6 tracking-tight leading-tight">{selectedProposal.title}</h1>
            
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                {formatTimeLeft(selectedProposal.end_date)} remaining
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" strokeWidth={1.5} />
                {selectedProposal.participants.toLocaleString()} participants
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-6 py-8 space-y-8">
          {/* Proposal Summary */}
          <div>
            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-4">Executive Summary</div>
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded p-6">
              <p className="text-zinc-400 leading-relaxed">
                {selectedProposal.description}
              </p>
            </div>
          </div>

          {/* Voting Options */}
          <div>
            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-4">
              {hasVotedOnThis ? 'Your Vote (Results)' : 'Cast Your Vote'}
            </div>
            <div className="space-y-3">
              {selectedProposal.options.map((option) => {
                const votePercent = totalVotes > 0 ? Math.round((option.votes / total
