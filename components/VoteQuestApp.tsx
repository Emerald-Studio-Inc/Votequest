'use client'

import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, BarChart2, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, onAuthStateChange, getUserProfile } from '@/lib/supabase-auth';
import type { ProposalWithOptions, Achievement, UserAchievement } from '@/lib/supabase';
import {
    getUserByWallet,
    createUser,
    getActiveProposals,
    castVote as dbCastVote,
    getUserVotedProposals,
    getAchievements,
    getUserAchievements,
    checkAndAwardAchievements
} from '@/lib/database';
import { useAutoReload } from '@/hooks/useAutoReload';

// Screen Components
import SplashScreen from './SplashScreen';
import OnboardingScreen from './OnboardingScreen';
import LoginScreen from './LoginScreen';
import DashboardScreen from './DashboardScreen';
import ProposalDetailScreen from './ProposalDetailScreen';
import CreateProposalScreen from './CreateProposalScreen';
import ProposalsListScreen from './ProposalsListScreen';
import AnalyticsScreen from './AnalyticsScreen';
import SettingsScreen from './SettingsScreen';
import ReceiptsScreen from './ReceiptsScreen';
import AchievementsScreen from './AchievementsScreen';
import ProfileEditScreen from './ProfileEditScreen';
import LeaderboardScreen from './LeaderboardScreen';
import AdminDashboard from './AdminDashboard';
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
    coins: number;
}

const VoteQuestApp = () => {
    const [currentScreen, setCurrentScreen] = useState('splash');
    const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'proposals' | 'analytics' | 'settings'>('overview');
    const [userData, setUserData] = useState<UserData>({
        address: null,
        userId: null,
        level: 1,
        xp: 0,
        nextLevelXP: 100,
        streak: 0,
        votingPower: 100,
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
    const [captchaToken, setCaptchaToken] = useState<string>('');
    const [authUser, setAuthUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Blockchain removed - using database only
    const address = null;
    const isConnected = false;

    useAutoReload();

    // Check auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await getCurrentUser();
                setAuthUser(user);
                if (user) {
                    await loadUserProfile(user.id);
                    setCurrentScreen('dashboard');
                }
            } catch (error) {
                console.error('Error checking auth:', error);
            } finally {
                setAuthLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Listen for auth changes
    useEffect(() => {
        const authListener = onAuthStateChange(async (user) => {
            setAuthUser(user);
            if (user) {
                await loadUserProfile(user.id);
                setCurrentScreen('dashboard');
            } else {
                setCurrentScreen('login');
                setUserData({
                    address: null,
                    userId: null,
                    level: 1,
                    xp: 0,
                    nextLevelXP: 100,
                    streak: 0,
                    votingPower: 100,
                    votesCount: 0,
                    globalRank: 0,
                    achievements: [],
                    votedProposals: [],
                    coins: 0
                });
            }
        });
        return () => {
            authListener.then(({ data: { subscription } }) => subscription.unsubscribe());
        };
    }, []);

    // Load data on mount
    useEffect(() => {
        loadAchievements();
        loadProposals();
    }, []);

    // Check for returning user
    useEffect(() => {
        if (currentScreen === 'splash') {
            const hasVisited = localStorage.getItem('votequest_visited');
            if (hasVisited) {
                setCurrentScreen('checking');
            }
        }
    }, []);

    // Auto-reconnect check
    useEffect(() => {
        if (currentScreen === 'checking') {
            const timer = setTimeout(() => {
                setCurrentScreen(isConnected ? 'dashboard' : 'login');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentScreen, isConnected]);

    // Splash timer
    useEffect(() => {
        if (currentScreen === 'splash') {
            const timer = setTimeout(() => setCurrentScreen('onboarding1'), 1800);
            return () => clearTimeout(timer);
        }
    }, [currentScreen]);

    // Konami code for admin
    useEffect(() => {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'a'];
        let konamiIndex = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    setCurrentScreen('admin');
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('proposals-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'proposals'
            }, () => {
                loadProposals();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadUserProfile = async (authId: string) => {
        try {
            const profile = await getUserProfile(authId);
            if (profile) {
                const nextLevelXP = profile.level * 1000;
                setUserData({
                    address: profile.email,
                    userId: profile.id,
                    level: profile.level,
                    xp: profile.xp,
                    nextLevelXP: nextLevelXP,
                    streak: profile.streak,
                    votingPower: profile.voting_power,
                    votesCount: profile.votes_count,
                    globalRank: profile.global_rank,
                    achievements: [],
                    votedProposals: [],
                    coins: profile.coins
                });
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    const loadAchievements = async () => {
        const data = await getAchievements();
        setAchievements(data);
    };

    const loadProposals = async () => {
        try {
            const data = await getActiveProposals();
            setProposals(data);
        } catch (error) {
            console.error('Error loading proposals:', error);
        }
    };

    const triggerAnimation = (key: string) => {
        setAnimations(prev => ({ ...prev, [key]: true }));
        setTimeout(() => setAnimations(prev => ({ ...prev, [key]: false })), 500);
    };

    const hasVoted = (proposalId: string) => {
        return userData.votedProposals.includes(proposalId);
    };

    const castVote = async (proposalId: string, optionId: string, captchaToken: string) => {
        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userData.userId,
                    proposalId,
                    optionId,
                    captchaToken,
                    walletAddress: userData.address
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Vote failed');

            setUserData(prev => ({
                ...prev,
                votesCount: prev.votesCount + 1,
                coins: prev.coins + (data.coinsEarned || 10),
                votedProposals: [...prev.votedProposals, proposalId]
            }));

            return data;
        } catch (error) {
            console.error('Error voting:', error);
            throw error;
        }
    };

    const handleCreateProposal = async (proposalData: any) => {
        try {
            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...proposalData,
                    createdBy: userData.userId
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create proposal');

            setUserData(prev => ({
                ...prev,
                coins: prev.coins + (data.coinsEarned || 50)
            }));

            setCurrentScreen('dashboard');
            return data;
        } catch (error) {
            console.error('Error creating proposal:', error);
            throw error;
        }
    };

    // Navigation Component
    const BottomNavigation = () => (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className="glass rounded-2xl p-2 flex items-center justify-between shadow-2xl shadow-black/50 backdrop-blur-xl border border-white/10 w-full max-w-sm">
                {[
                    { label: 'Overview', value: 'overview' as const, icon: LayoutGrid },
                    { label: 'Proposals', value: 'proposals' as const, icon: List },
                    { label: 'Analytics', value: 'analytics' as const, icon: BarChart2 },
                    { label: 'Settings', value: 'settings' as const, icon: Settings }
                ].map((item) => {
                    const isActive = activeDashboardTab === item.value;
                    const Icon = item.icon;
                    return (
                        <Tooltip key={item.value} content={item.label} position="top">
                            <button
                                onClick={() => setActiveDashboardTab(item.value)}
                                className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} strokeWidth={isActive ? 2 : 1.5} />
                                {isActive && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-fade-in"></span>
                                )}
                            </button>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );

    // Render screens
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

    if (currentScreen === 'splash') return <SplashScreen />;
    if (currentScreen.startsWith('onboarding')) return <OnboardingScreen currentScreen={currentScreen} onNext={setCurrentScreen} />;
    if (currentScreen === 'login') return <LoginScreen loading={loading} />;

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
                    <AnalyticsScreen userData={userData} proposals={proposals} />
                )}
                {activeDashboardTab === 'settings' && (
                    <SettingsScreen userData={userData} onNavigate={setCurrentScreen} />
                )}
                <BottomNavigation />
            </>
        );
    }

    if (currentScreen === 'create-proposal') {
        return <CreateProposalScreen onBack={() => setCurrentScreen('dashboard')} onSubmit={handleCreateProposal} loading={loading} />;
    }

    if (currentScreen === 'receipts') {
        return <ReceiptsScreen userId={userData.userId || ''} onBack={() => setCurrentScreen('dashboard')} />;
    }

    if (currentScreen === 'achievements') {
        return <AchievementsScreen userData={userData} onBack={() => setCurrentScreen('dashboard')} />;
    }

    if (currentScreen === 'profile-edit') {
        return (
            <ProfileEditScreen
                userData={userData}
                onBack={() => setCurrentScreen('dashboard')}
                onSave={(updated) => setUserData(prev => ({ ...prev, ...updated }))}
            />
        );
    }

    if (currentScreen === 'leaderboard') {
        return <LeaderboardScreen userData={userData} onBack={() => setCurrentScreen('dashboard')} />;
    }

    if (currentScreen === 'admin') {
        return <AdminDashboard onBack={() => setCurrentScreen('dashboard')} />;
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
