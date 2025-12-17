'use client'

import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, BarChart2, Settings, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, onAuthStateChange, getUserProfile } from '@/lib/supabase-auth';
import type { ProposalWithOptions, Achievement, UserAchievement } from '@/lib/supabase';
import {
    getUserByWallet,
    createUser,
    getActiveProposals,
    getAllProposals,
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
import CommunityScreen from './CommunityScreen';
import DebateArena from './DebateArena';
import EntranceExam from './EntranceExam';
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
import QuestGuide from './QuestGuide';
import OrganizationListScreen from './OrganizationListScreen';
import OrganizationDashboard from './OrganizationDashboard';
import OrganizationSetup from './OrganizationSetup';
import RoomDetailScreen from './RoomDetailScreen';
import CreateRoomWizard from './CreateRoomWizard';

interface UserData {
    address: string | null;
    userId: string | null;
    email: string | null;
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
    const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'proposals' | 'analytics' | 'settings' | 'community'>('overview');
    const [userData, setUserData] = useState<UserData>({
        address: null,
        userId: null,
        email: null,
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
    const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [aiMessage, setAiMessage] = useState<string | null>(null);

    // Blockchain removed - using database only
    const address = null;
    const isConnected = false;

    // Auto-reload disabled - users can manually refresh if needed
    // useAutoReload();

    // ---------------------------------------------------------
    // HELPERS MOVED TO TOP to fix "block-scoped variable" build errors
    // ---------------------------------------------------------
    const loadUserProfile = async (authId: string) => {
        // Log removed('[AUTH] Loading user profile for authId:', authId);
        try {
            const profile = await getUserProfile(authId);
            // Log removed('[AUTH] Profile loaded:', profile);

            if (profile) {
                const nextLevelXP = profile.level * 1000;

                // Load user's voted proposals from database
                const votedProposalIds = await getUserVotedProposals(profile.id);
                // Log removed('[AUTH] Loaded voted proposals:', votedProposalIds.length);

                setUserData({
                    address: profile.email,
                    userId: profile.id,
                    email: profile.email,
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
                // Log removed('[AUTH] User data set successfully. userId:', profile.id);
            } else {
                console.warn('[AUTH] No profile found for authId:', authId);
                // Log removed('[AUTH] Attempting to create profile...');

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
                            email: newProfile.email,
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
                        // Log removed('[AUTH] Profile created! userId:', newProfile.id);
                    } else {
                        // Check if error is due to unique constraint violation (duplicate profile)
                        if (error?.code === '23505') {
                            // Log removed('[AUTH] Profile already exists (unique constraint), fetching existing profile...');
                            // Try to fetch the existing profile by email or auth_id
                            const existingProfile = await getUserProfile(authId);
                            if (existingProfile) {
                                const nextLevelXP = existingProfile.level * 1000;

                                // Load voted proposals for existing profile
                                const votedProposalIds = await getUserVotedProposals(existingProfile.id);

                                setUserData({
                                    address: existingProfile.email,
                                    userId: existingProfile.id,
                                    email: existingProfile.email,
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
                                // Log removed('[AUTH] Using existing profile! userId:', existingProfile.id);
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
            const data = await getAllProposals();
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
            const payload = {
                ...proposalData,
                userId: userData.userId
            };
            // Log removed('[DEBUG] Creating proposal payload:', payload);

            const response = await fetch('/api/proposal/create-simple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
                        const shareUrl = `${window.location.origin}/share/${data.proposal?.blockchain_id || data.proposal?.id}`;
                        navigator.clipboard.writeText(shareUrl);
                        toast.info('Link copied!', 'Share this link to invite others to vote.');
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

    // ---------------------------------------------------------
    // END HELPERS
    // ---------------------------------------------------------


    // Initial load check
    useEffect(() => {
        const checkUser = async () => {
            try {
                // Add race condition/timeout to avoid infinite hanging
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout')), 10000)
                );

                const userPromise = getCurrentUser(); // Returns user object directly

                const user = await Promise.race([userPromise, timeoutPromise]) as any;

                if (user) {
                    // Also timeout the profile load
                    await Promise.race([
                        loadUserProfile(user.id),
                        timeoutPromise
                    ]);
                    setAuthLoading(false);
                    setCurrentScreen('dashboard');
                } else {
                    setAuthLoading(false);
                    if (currentScreen === 'checking') {
                        setCurrentScreen('login');
                    }
                }
            } catch (error) {
                console.error('Error checking user:', error);
                setAuthLoading(false);
                // If it was a timeout, we still want to show login, maybe with a toast?
                setCurrentScreen('login');
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                try {
                    await loadUserProfile(session.user.id);
                    setAuthLoading(false);
                    setCurrentScreen('dashboard');
                } catch (e) {
                    console.error('Sign-in profile load error:', e);
                    setAuthLoading(false); // Ensure we don't hang
                }
            } else if (event === 'SIGNED_OUT') {
                setUserData({
                    address: null,
                    userId: null,
                    email: null,
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
                setAuthLoading(false);
                setCurrentScreen('login');
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // AI Welcome Trigger
    useEffect(() => {
        if (currentScreen === 'dashboard' && !aiMessage && userData.userId) {
            // 1s delay for welcome
        }
    }, [currentScreen, userData.userId]);

    const hasWelcomed = React.useRef(false);
    useEffect(() => {
        if (currentScreen === 'dashboard' && !hasWelcomed.current && userData.userId) {
            hasWelcomed.current = true;
            setTimeout(() => {
                setAiMessage("CITIZEN_RECOGNIZED. WELCOME TO VOTEQUEST. ACCESSING NAV_SYSTEM...");
            }, 1000);
        }
    }, [currentScreen, userData.userId]);

    // Play sound on screen navigation
    useEffect(() => {
        // Import dynamically to avoid SSR issues
        import('@/lib/sfx').then(({ sfx }) => sfx.playClick());
    }, [currentScreen]);

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
                // Log removed('[SHARE LINK] Auto-opening proposal:', targetProposalId);

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

    // Auto-reconnect check removed (conflicted with Supabase auth)
    /*
    useEffect(() => {
        if (currentScreen === 'checking') {
            const timer = setTimeout(() => {
                setCurrentScreen(isConnected ? 'dashboard' : 'login');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentScreen, isConnected]);
    */

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
    const [adminPassphrase, setAdminPassphrase] = useState('');
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
                    // Log removed('[ADMIN] Session timeout - logging out');
                    setCurrentScreen('dashboard');
                    setAdminSessionStart(null);
                    alert('Admin session expired after 5 minutes. Please re-authenticate.');
                }
            }, 30000); // Check every 30 seconds

            return () => clearInterval(checkTimeout);
        }
    }, [currentScreen, adminSessionStart]);

    // Admin access handler - modal already verified passphrase and 2FA
    const handleAdminAccess = async (passphrase: string) => {
        try {
            // Log successful access
            await fetch('/api/admin/log-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ granted: true, passphrase_attempts: 1 })
            });

            // Grant access and start session timer
            setAdminPassphrase(passphrase);
            setAdminSessionStart(Date.now());
            setCurrentScreen('admin');
            setShowAdminModal(false);

            // Log removed('[ADMIN] Access granted via 2FA. Session will expire in 5 minutes');
        } catch (error) {
            console.error('[ADMIN] Error during access check:', error);
            alert('Error granting admin access. Please try again.');
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

    // Functions moved to top to satisfy scope needs


    // Navigation Component - Arcade Style with inline colors for visibility
    const NEON_CYAN = '#00F0FF';

    const BottomNavigation = () => (
        <div className="fixed bottom-0 sm:bottom-6 left-0 right-0 z-[2000] flex justify-center px-0 sm:px-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div
                className="relative bg-black/90 sm:bg-black/80 backdrop-blur-xl w-full sm:max-w-sm pb-safe pt-2 sm:pb-0 sm:pt-0"
                style={{
                    borderTop: `1px solid ${NEON_CYAN}`,
                    borderLeft: '1px solid transparent',
                    borderRight: '1px solid transparent',
                    borderBottom: '1px solid transparent',
                    // Only show box shadow on desktop/sm+
                    boxShadow: typeof window !== 'undefined' && window.innerWidth >= 640 ? `0 0 20px rgba(0,240,255,0.2)` : 'none'
                }}
            >
                {/* Decorative Tech Lines - Desktop Only */}
                <div className="hidden sm:block absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: NEON_CYAN }}></div>
                <div className="hidden sm:block absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: NEON_CYAN }}></div>
                <div className="hidden sm:block absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: NEON_CYAN }}></div>
                <div className="hidden sm:block absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: NEON_CYAN }}></div>

                <div className="flex items-center justify-between p-2">
                    {[
                        { label: 'Overview', value: 'overview' as const, icon: LayoutGrid },
                        { label: 'Proposals', value: 'proposals' as const, icon: List },
                        { label: 'Community', value: 'community' as const, icon: MessageSquare },
                        { label: 'Analytics', value: 'analytics' as const, icon: BarChart2 },
                        { label: 'Settings', value: 'settings' as const, icon: Settings }
                    ].map((item) => {
                        const isActive = activeDashboardTab === item.value;
                        const Icon = item.icon;
                        return (
                            <Tooltip key={item.value} content={item.label} position="top">
                                <button
                                    onClick={() => setActiveDashboardTab(item.value)}
                                    className="relative group flex flex-col items-center justify-center w-14 h-14 transition-all duration-300"
                                    style={{ color: isActive ? NEON_CYAN : 'rgba(255,255,255,0.6)' }}
                                >
                                    <div
                                        className="absolute inset-0 transition-all duration-300"
                                        style={{
                                            backgroundColor: isActive ? `${NEON_CYAN}15` : 'transparent',
                                            border: isActive ? `1px solid ${NEON_CYAN}` : '1px solid transparent',
                                            boxShadow: isActive ? `0 0 10px ${NEON_CYAN}` : 'none'
                                        }}
                                    ></div>

                                    <Icon
                                        className="w-5 h-5 z-10 transition-transform duration-300"
                                        style={{
                                            color: isActive ? NEON_CYAN : '#9CA3AF',
                                            transform: isActive ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                        strokeWidth={isActive ? 2.5 : 1.5}
                                    />

                                    {isActive && (
                                        <span
                                            className="absolute -bottom-1 w-1 h-1 rounded-full animate-pulse"
                                            style={{ backgroundColor: NEON_CYAN, boxShadow: `0 0 5px ${NEON_CYAN}` }}
                                        ></span>
                                    )}
                                </button>
                            </Tooltip>
                        );
                    })}
                </div>
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
                {activeDashboardTab === 'community' && (
                    <div className="pb-24">
                        <CommunityScreen
                            onNavigate={(screen, data) => {
                                if (screen === 'thread') {
                                    if (data === 2) {
                                        setCurrentScreen('entrance-exam');
                                    } else {
                                        setCurrentScreen('debate');
                                    }
                                }
                            }}
                        />
                    </div>
                )}
                <BottomNavigation />
                <QuestGuide
                    currentScreen={currentScreen}
                    onNavigate={(screen) => {
                        if (screen === 'proposals') {
                            setCurrentScreen('dashboard');
                            setActiveDashboardTab('proposals');
                        } else {
                            setCurrentScreen(screen);
                            // If navigating to dashboard via map, reset to overview
                            if (screen === 'dashboard') setActiveDashboardTab('overview');
                        }
                    }}
                    message={aiMessage}
                    onMessageComplete={() => setAiMessage(null)}
                />
                <AdminPassphraseModal
                    open={showAdminModal}
                    onClose={() => setShowAdminModal(false)}
                    onSuccess={handleAdminAccess}
                />
                {showSetup2FA && (
                    <AdminSetup2FA
                        onClose={() => {
                            setShowSetup2FA(false);
                            setSetup2FAPassphrase('');
                        }}
                        passphrase={setup2FAPassphrase}
                    />
                )}
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
        return <AdminDashboard onBack={() => setCurrentScreen('dashboard')} passphrase={adminPassphrase} />;
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
                    setSelectedOrganizationId(orgId);
                    localStorage.setItem('votequest_current_org', orgId);
                    setCurrentScreen('org-dashboard');
                }}
                onCreateNew={() => setCurrentScreen('org-setup')}
                onBack={() => setCurrentScreen('dashboard')}
            />
        );
    }

    // Organization Dashboard
    if (currentScreen === 'org-dashboard' && selectedOrganizationId) {
        return (
            <OrganizationDashboard
                organizationId={selectedOrganizationId}
                userId={userData.userId || ''}
                email={userData.email || ''}
                currentCoins={userData.coins}
                onNavigate={(screen, data) => {
                    if (screen === 'organization-list') {
                        setCurrentScreen('organization');
                    } else if (screen === 'create-room') {
                        setCurrentScreen('create-room');
                    } else if (screen === 'room' && data) {
                        // Navigate to room detail
                        setSelectedRoomId(data.id);
                        setCurrentScreen('room-detail');
                    }
                }}
            />
        );
    }

    // Organization Setup
    if (currentScreen === 'org-setup') {
        return (
            <OrganizationSetup
                userId={userData.userId || ''}
                onComplete={(organizationId: string) => {
                    setSelectedOrganizationId(organizationId);
                    setCurrentScreen('org-dashboard');
                }}
                onCancel={() => setCurrentScreen('organization')}
            />
        );
    }

    // Room Detail Screen
    if (currentScreen === 'room-detail' && selectedRoomId && selectedOrganizationId) {
        return (
            <RoomDetailScreen
                roomId={selectedRoomId}
                organizationId={selectedOrganizationId}
                userId={userData.userId || ''}
                onBack={() => setCurrentScreen('org-dashboard')}
            />
        );
    }

    // Create Room Screen
    if (currentScreen === 'create-room' && selectedOrganizationId) {
        return (
            <CreateRoomWizard
                organizationId={selectedOrganizationId}
                organizationName="Organization"
                userId={userData.userId || ''}
                onComplete={(roomId) => {
                    setSelectedRoomId(roomId);
                    setCurrentScreen('room-detail');
                }}
                onCancel={() => setCurrentScreen('org-dashboard')}
            />
        );
    }

    // Community & Debates
    if (currentScreen === 'community' || (currentScreen === 'dashboard' && activeDashboardTab === 'community')) {
        return (
            <div className="pb-24">
                <CommunityScreen
                    onNavigate={(screen, data) => {
                        if (screen === 'thread') {
                            if (data === 2) {
                                setCurrentScreen('entrance-exam');
                            } else {
                                setCurrentScreen('debate');
                            }
                        }
                    }}
                />
                <BottomNavigation />
            </div>
        );
    }

    if (currentScreen === 'debate') {
        return <DebateArena roomId="test" onBack={() => setCurrentScreen('community')} />;
    }

    if (currentScreen === 'entrance-exam') {
        return (
            <EntranceExam
                onPass={() => setCurrentScreen('debate')}
                onFail={() => setCurrentScreen('community')}
                onCancel={() => setCurrentScreen('community')}
            />
        );
    }

    // Fallback for navigation errors
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Navigation Error</h1>
            <p className="text-gray-400 mb-6">
                The application encountered an unexpected state.<br />
                Current Screen: {currentScreen}
            </p>
            <button
                onClick={() => setCurrentScreen('dashboard')}
                className="btn btn-primary"
            >
                Return to Dashboard
            </button>
        </div>
    );
};

export default VoteQuestApp;
