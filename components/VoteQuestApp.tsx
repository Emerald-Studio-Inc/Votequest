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
// Auto-reload disabled - was causing annoying mid-task refreshes
// import { useAutoReload } from '@/hooks/useAutoReload';

// Screen Components
import SplashScreen from './SplashScreen';
import OnboardingScreen from './OnboardingScreen';
import LoginScreen from './LoginScreen';
import DashboardScreen from './DashboardScreen';
import ProposalDetailScreen from './ProposalDetailScreen';
import CreateProposalScreen from './CreateProposalScreen';
import ProposalsListScreen from './ProposalsListScreen';
import SettingsScreen from './SettingsScreen';
import ReceiptsScreen from './ReceiptsScreen';
import AchievementsScreen from './AchievementsScreen';
import ProfileEditScreen from './ProfileEditScreen';
import LeaderboardScreen from './LeaderboardScreen';
import dynamic from 'next/dynamic';

const AnalyticsScreen = dynamic(() => import('./AnalyticsScreen'), {
    ssr: false,
});

const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
    ssr: false,
});
import Tooltip from './Tooltip';
import AdminPassphraseModal from './AdminPassphraseModal';
import AdminSetup2FA from './AdminSetup2FA';
import OrganizationListScreen from './OrganizationListScreen';
import OrganizationDashboard from './OrganizationDashboard';
import OrganizationSetup from './OrganizationSetup';
import RoomDetailScreen from './RoomDetailScreen';
import AdminVerificationDashboard from './AdminVerificationDashboard';
import BottomNavigation from './BottomNavigation';

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
    const [currentOrganization, setCurrentOrganization] = useState<string | null>(null);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [authUser, setAuthUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Blockchain removed - using database only
    const address = null;
    const isConnected = false;

    // Auto-reload disabled - users can manually refresh if needed
    // useAutoReload();

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

    // Auto-open target proposal from share link
    useEffect(() => {
        if (currentScreen === 'dashboard' && proposals.length > 0) {
            const targetProposalId = localStorage.getItem('targetProposalId');
            if (targetProposalId) {
                console.log('[SHARE LINK] Auto-opening proposal:', targetProposalId);

                // Find proposal by blockchain_id
                const proposal = proposals.find(p => p.blockchain_id?.toString() === targetProposalId);

                if (proposal) {
                    setSelectedProposal(proposal);
                    setCurrentScreen('proposal');
                    localStorage.removeItem('targetProposalId'); // Clear after use
                } else {
                    console.warn('[SHARE LINK] Proposal not found:', targetProposalId);
                    localStorage.removeItem('targetProposalId');
                }
            }
        }
    }, [currentScreen, proposals]);

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

    // Konami code for admin (gated behind env flag for safety)
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showSetup2FA, setShowSetup2FA] = useState(false);
    const [setup2FAPassphrase, setSetup2FAPassphrase] = useState('');
    const [adminSessionStart, setAdminSessionStart] = useState<number | null>(null);
    const ADMIN_SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    useEffect(() => {
        const enabled = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR === 'true');
        if (!enabled) {
            // Backdoor disabled in this environment — do nothing
            return;
        }

        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'a'];
        let konamiIndex = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Shift+A for 2FA setup
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                const passphrase = prompt('Enter admin passphrase to access 2FA setup:');
                if (passphrase) {
                    setSetup2FAPassphrase(passphrase);
                    setShowSetup2FA(true);
                }
                return;
            }

            // Konami code for admin login
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    // Instead of immediately opening admin, show passphrase modal
                    setShowAdminModal(true);
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Admin session timeout - auto-logout after 5 minutes
    useEffect(() => {
        if (currentScreen === 'admin' && adminSessionStart) {
            const checkTimeout = setInterval(() => {
                const elapsed = Date.now() - adminSessionStart;
                if (elapsed >= ADMIN_SESSION_TIMEOUT) {
                    console.log('[ADMIN] Session timeout - logging out');
                    setCurrentScreen('dashboard');
                    setAdminSessionStart(null);
                    alert('Admin session expired after 5 minutes. Please re-authenticate.');
                }
            }, 30000); // Check every 30 seconds

            return () => clearInterval(checkTimeout);
        }
    }, [currentScreen, adminSessionStart]);

    // Admin access handler with 2FA security
    const handleAdminAccess = async (passphrase: string, code: string) => {
        let passphraseAttempts = 1;

        try {
            // 1. Verify passphrase
            const correctPassphrase = process.env.NEXT_PUBLIC_ADMIN_PASSPHRASE;
            if (!correctPassphrase || passphrase !== correctPassphrase) {
                // Log failed attempt
                await fetch('/api/admin/log-access', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ granted: false, passphrase_attempts: passphraseAttempts })
                });
                alert('Invalid passphrase. Access denied.');
                setShowAdminModal(false);
                return;
            }

            // 2. Verify 2FA code
            const tfaCheck = await fetch('/api/admin/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const tfaData = await tfaCheck.json();

            if (!tfaData.valid) {
                // Log rejected 2FA
                await fetch('/api/admin/log-access', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ granted: false, passphrase_attempts: 1 })
                });
                alert('Invalid 2FA code. Access denied.');
                setShowAdminModal(false);
                return;
            }

            // 3. Log successful access
            await fetch('/api/admin/log-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ granted: true, passphrase_attempts: 1 })
            });

            // 4. Grant access and start session timer
            setAdminSessionStart(Date.now());
            setCurrentScreen('admin');
            setShowAdminModal(false);

            console.log('[ADMIN] Access granted via 2FA. Session will expire in 5 minutes.');
        } catch (error) {
            console.error('[ADMIN] Error during access check:', error);
            alert('Error verifying admin access. Please try again.');
            setShowAdminModal(false);
        }
    };

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
        console.log('[AUTH] Loading user profile for authId:', authId);
        try {
            const profile = await getUserProfile(authId);
            console.log('[AUTH] Profile loaded:', profile);

            if (profile) {
                const nextLevelXP = profile.level * 1000;

                // Load user's voted proposals from database
                const votedProposalIds = await getUserVotedProposals(profile.id);
                console.log('[AUTH] Loaded voted proposals:', votedProposalIds.length);

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
                    votedProposals: votedProposalIds, // Now loaded from database!
                    coins: profile.coins
                });
                console.log('[AUTH] User data set successfully. userId:', profile.id);
            } else {
                console.warn('[AUTH] No profile found for authId:', authId);
                console.log('[AUTH] Attempting to create profile...');

                // Create profile
                const user = await getCurrentUser();
                if (user?.email) {
                    const { data: newProfile, error } = await supabase
                        .from('users')
                        .insert({
                            auth_id: authId,
                            email: user.email,
                            username: user.email.split('@')[0],
                            age_verified: true,
                            xp: 0,
                            level: 1,
                            coins: 0,
                            votes_count: 0,
                            voting_power: 100,
                            streak: 0,
                            global_rank: 0
                        })
                        .select()
                        .single();

                    if (!error && newProfile) {
                        const nextLevelXP = newProfile.level * 1000;
                        setUserData({
                            address: newProfile.email,
                            userId: newProfile.id,
                            level: newProfile.level,
                            xp: newProfile.xp,
                            nextLevelXP: nextLevelXP,
                            streak: newProfile.streak,
                            votingPower: newProfile.voting_power,
                            votesCount: newProfile.votes_count,
                            globalRank: newProfile.global_rank,
                            achievements: [],
                            votedProposals: [], // New profile, no votes yet
                            coins: newProfile.coins
                        });
                        console.log('[AUTH] Profile created! userId:', newProfile.id);
                    } else {
                        // Check if error is due to unique constraint violation (duplicate profile)
                        if (error?.code === '23505') {
                            console.log('[AUTH] Profile already exists (unique constraint), fetching existing profile...');
                            // Try to fetch the existing profile by email or auth_id
                            const existingProfile = await getUserProfile(authId);
                            if (existingProfile) {
                                const nextLevelXP = existingProfile.level * 1000;

                                // Load voted proposals for existing profile
                                const votedProposalIds = await getUserVotedProposals(existingProfile.id);

                                setUserData({
                                    address: existingProfile.email,
                                    userId: existingProfile.id,
                                    level: existingProfile.level,
                                    xp: existingProfile.xp,
                                    nextLevelXP: nextLevelXP,
                                    streak: existingProfile.streak,
                                    votingPower: existingProfile.voting_power,
                                    votesCount: existingProfile.votes_count,
                                    globalRank: existingProfile.global_rank,
                                    achievements: [],
                                    votedProposals: votedProposalIds, // Load from database
                                    coins: existingProfile.coins
                                });
                                console.log('[AUTH] Using existing profile! userId:', existingProfile.id);
                            } else {
                                console.error('[AUTH] Unique constraint error but could not fetch existing profile');
                            }
                        } else {
                            console.error('[AUTH] Failed to create profile:', error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[AUTH] Error loading user profile:', error);
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
                    walletAddress: null  // Magic link auth - no wallet
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Vote failed');

            // Update user data
            setUserData(prev => ({
                ...prev,
                votesCount: prev.votesCount + 1,
                coins: prev.coins + (data.coinsEarned || 10),
                votedProposals: [...prev.votedProposals, proposalId]
            }));

            // Import toast dynamically
            const { toast } = await import('@/lib/toast');

            // Show success toast
            toast.success(
                'Vote cast successfully!',
                `+${data.coinsEarned || 10} VQC earned`,
                {
                    label: 'View Receipt',
                    onClick: () => setCurrentScreen('receipts')
                }
            );

            return data;
        } catch (error) {
            console.error('Error voting:', error);

            // Show error toast
            const { toast } = await import('@/lib/toast');
            toast.error(
                'Vote failed',
                error instanceof Error ? error.message : 'Please try again'
            );

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

            // Update coins
            setUserData(prev => ({
                ...prev,
                coins: prev.coins + (data.coinsEarned || 50)
            }));

            // Import toast dynamically
            const { toast } = await import('@/lib/toast');

            // Show success toast
            toast.success(
                'Proposal created!',
                `+${data.coinsEarned || 50} VQC earned`,
                {
                    label: 'Share Proposal',
                    onClick: () => {
                        // TODO: Open share modal
                    }
                }
            );

            setCurrentScreen('dashboard');
            return data;
        } catch (error) {
            console.error('Error creating proposal:', error);

            // Show error toast
            const { toast } = await import('@/lib/toast');
            toast.error(
                'Failed to create proposal',
                error instanceof Error ? error.message : 'Please try again'
            );

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
                <BottomNavigation
                    activeTab={activeDashboardTab}
                    onTabChange={setActiveDashboardTab}
                />
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

    // Organization navigation
    if (currentScreen === 'organization') {
        return (
            <OrganizationListScreen
                userId={userData.userId || ''}
                onSelectOrganization={(orgId) => {
                    localStorage.setItem('votequest_current_org', orgId);
                    setCurrentOrganization(orgId);
                    setCurrentScreen('organization-dashboard');
                }}
                onCreateNew={() => setCurrentScreen('organization-setup')}
                onBack={() => setCurrentScreen('dashboard')}
            />
        );
    }

    // Organization setup
    if (currentScreen === 'organization-setup') {
        return (
            <OrganizationSetup
                userId={userData.userId || ''}
                onComplete={(orgId) => {
                    localStorage.setItem('votequest_current_org', orgId);
                    setCurrentOrganization(orgId);
                    setCurrentScreen('organization-dashboard');
                }}
                onCancel={() => setCurrentScreen('organization')}
            />
        );
    }

    // Organization dashboard
    if (currentScreen === 'organization-dashboard' && currentOrganization) {
        return (
            <OrganizationDashboard
                organizationId={currentOrganization}
                userId={userData.userId || ''}
                onNavigate={(screen, data) => {
                    if (screen === 'create-room') setShowCreateRoom(true);
                    if (screen === 'room' && data) {
                        setCurrentRoom(data);
                        setCurrentScreen('room-detail');
                    }
                    if (screen === 'organization-list') {
                        setCurrentOrganization(null);
                        setCurrentScreen('organization');
                    }
                    if (screen === 'dashboard') {
                        setCurrentOrganization(null);
                        localStorage.removeItem('votequest_current_org');
                        setCurrentScreen('dashboard');
                    }
                }}
            />
        );
    }

    // Room detail screen
    if (currentScreen === 'room-detail' && currentRoom) {
        return (
            <RoomDetailScreen
                roomId={currentRoom}
                organizationId={currentOrganization}
                userId={userData.userId || ''}
                onBack={() => setCurrentScreen('organization-dashboard')}
            />
        );
    }

    // Admin verification dashboard
    if (currentScreen === 'admin-verification') {
        return (
            <AdminVerificationDashboard
                onBack={() => setCurrentScreen('dashboard')}
            />
        );
    }

    return null;
};

export default VoteQuestApp;
