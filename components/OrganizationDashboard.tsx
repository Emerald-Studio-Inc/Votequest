import { useState, useEffect } from 'react';
import { Building2, Plus, Users, Vote, Settings, BarChart3, Clock, ChevronRight, Zap } from 'lucide-react';
import SubscriptionStatus from './SubscriptionStatus';
import SubscriptionPicker from './SubscriptionPicker';
import OrganizationAdminLayout from './admin/OrganizationAdminLayout';
import TurnoutHeatmap from './analytics/TurnoutHeatmap';
import VoterDemographics from './analytics/VoterDemographics';
import CyberCard from './CyberCard';
import CyberButton from './CyberButton';
import CoinBadge from './CoinBadge';
import CoinsPurchaseModal from './CoinsPurchaseModal';

interface OrganizationDashboardProps {
    organizationId: string;
    userId: string;
    email: string;
    currentCoins?: number;
    onNavigate?: (screen: string, data?: any) => void;
}

const NEON_CYAN = '#0055FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

export default function OrganizationDashboard({
    organizationId,
    userId,
    email,
    currentCoins = 0,
    onNavigate
}: OrganizationDashboardProps) {
    const [organization, setOrganization] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSubscriptionPicker, setShowSubscriptionPicker] = useState(false);
    const [showCoinsModal, setShowCoinsModal] = useState(false);

    useEffect(() => {
        loadOrganization();
        loadRooms();
    }, [organizationId]);

    const loadOrganization = async () => {
        try {
            const response = await fetch(`/api/organizations/${organizationId}`);
            if (response.ok) {
                const data = await response.json();
                setOrganization(data.organization);
            } else {
                // Fallback to basic info if detailed fetch fails
                setOrganization({
                    id: organizationId,
                    name: 'Organization',
                    type: 'other',
                    subscription_tier: 'free'
                });
            }
        } catch (error) {
            console.error('Error loading organization:', error);
            // Fallback to basic info
            setOrganization({
                id: organizationId,
                name: 'Organization',
                type: 'other',
                subscription_tier: 'free'
            });
        }
    };

    const loadRooms = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/rooms?organizationId=${organizationId}`);
            if (response.ok) {
                const data = await response.json();
                setRooms(data.rooms || []);
                // Log removed('Loaded rooms:', data.rooms);
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!organization) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${NEON_CYAN}40`, borderTopColor: NEON_CYAN }}></div>
                    <p className="text-xs font-mono text-gray-400 animate-pulse uppercase">LOADING_ORG_DATA...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 relative font-mono relative z-10" style={{ backgroundColor: 'rgba(5, 5, 5, 0.4)' }}>
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl" style={{ borderBottom: `1px solid ${NEON_CYAN}30` }}>
                <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate?.('organization-list')}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                                title="Back to Organizations"
                            >
                                <div className="w-8 h-8 flex items-center justify-center border group-hover:bg-white/10 transition-colors" style={{ borderColor: NEON_CYAN }}>
                                    <Vote className="w-4 h-4" style={{ color: NEON_CYAN }} strokeWidth={2.5} />
                                </div>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="font-bold text-sm uppercase text-white tracking-wider">VOTEQUEST</span>
                                    <span className="text-[10px] text-gray-500 uppercase group-hover:text-gray-300"><ChevronRight className="w-3 h-3 inline" /> RETURN</span>
                                </div>
                            </button>
                            <div className="h-8 w-px bg-gray-800 hidden md:block"></div>
                            <div>
                                <h1 className="text-xl font-bold uppercase tracking-wider text-white glitch-text" data-text={organization.name}>{organization.name}</h1>
                                <p className="text-[10px] font-mono uppercase flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 border border-gray-700 rounded-none text-gray-400">{organization.type}</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-white" style={{ textShadow: `0 0 10px ${organization.subscription_tier === 'pro' ? NEON_MAGENTA : NEON_CYAN}` }}>
                                        {organization.subscription_tier} TIER
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <CyberButton onClick={() => setShowSubscriptionPicker(true)} className="!py-1.5 !px-3">
                                <Zap className="w-4 h-4 mr-2 inline-block" />
                                UPGRADE
                            </CyberButton>
                            <CyberButton onClick={() => setShowCoinsModal(true)} className="!py-1.5 !px-3">
                                <Plus className="w-4 h-4 mr-2 inline-block" />
                                BUY_COINS
                            </CyberButton>
                            <CoinBadge
                                coins={currentCoins}
                                onClick={() => setShowCoinsModal(true)}
                                showLabel={true}
                            />
                            <CyberButton
                                onClick={() => onNavigate?.('create-room', { organizationId })}
                                className="hidden md:flex items-center gap-2 !py-2 !px-4"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                NEW_ARENA
                            </CyberButton>
                            {/* Mobile Create Button */}
                            <CyberButton
                                onClick={() => onNavigate?.('create-room', { organizationId })}
                                className="flex md:hidden items-center justify-center w-10 h-10 p-0"
                            >
                                <Plus className="w-5 h-5" />
                            </CyberButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-12 relative z-10">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    <CyberCard className="p-6 bg-black/80 border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Vote className="w-5 h-5 text-gray-200" />
                            <p className="text-[10px] text-gray-100 uppercase font-mono">ACTIVE_ROOMS</p>
                        </div>
                        <p className="text-3xl font-bold text-white font-mono">{rooms.filter(r => r.status === 'active').length}</p>
                    </CyberCard>

                    <CyberCard className="p-6 bg-black/80 border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-gray-200" />
                            <p className="text-[10px] text-gray-300 uppercase font-mono">TOTAL_VOTERS</p>
                        </div>
                        <p className="text-3xl font-bold text-white font-mono">0</p>
                    </CyberCard>

                    <CyberCard className="p-6 bg-black/80 border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-gray-200" />
                            <p className="text-[10px] text-gray-300 uppercase font-mono">TURNOUT_RATE</p>
                        </div>
                        <p className="text-3xl font-bold text-white font-mono">-%</p>
                    </CyberCard>
                </div>

                {/* Rooms List */}
                <CyberCard className="p-8 bg-black/80 border-white/10" title="VOTING_CHAMBERS" cornerStyle="tech">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${NEON_CYAN}40`, borderTopColor: NEON_CYAN }}></div>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-gray-700 bg-black/50">
                            <div className="w-16 h-16 mx-auto mb-4 border flex items-center justify-center rounded-none" style={{ borderColor: NEON_CYAN, backgroundColor: `${NEON_CYAN}10` }}>
                                <Vote className="w-8 h-8 animate-pulse" style={{ color: NEON_CYAN }} />
                            </div>
                            <p className="text-gray-200 mb-6 font-mono text-sm uppercase">NO_ACTIVE_CHAMBERS_DETECTED</p>
                            <CyberButton
                                onClick={() => onNavigate?.('room-wizard')}
                            >
                                INITIALIZE_FIRST_ROOM
                            </CyberButton>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="p-4 bg-black/60 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => onNavigate?.('room', room)}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-700 group-hover:bg-[color:var(--status-color)] transition-colors"
                                        style={{ '--status-color': room.status === 'active' ? NEON_LIME : room.status === 'draft' ? '#60A5FA' : '#E5E7EB' } as React.CSSProperties}
                                    />

                                    <div className="flex items-start justify-between pl-4">
                                        <div>
                                            <h4 className="font-bold text-white mb-1 uppercase tracking-wide group-hover:text-[color:var(--status-color)] transition-colors"
                                                style={{ '--status-color': room.status === 'active' ? NEON_LIME : room.status === 'draft' ? '#60A5FA' : 'white' } as React.CSSProperties}
                                            >
                                                {room.title}
                                            </h4>
                                            <p className="text-xs text-gray-300 font-mono line-clamp-1">{'>'} {room.description}</p>
                                        </div>
                                        <div className={`px-2 py-1 text-[10px] font-bold uppercase border ${room.status === 'active' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                                            room.status === 'draft' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                                                'border-gray-600 text-gray-400 bg-gray-800/50'
                                            }`}>
                                            {room.status === 'active' ? 'LIVE_STATUS' : room.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CyberCard>

                {/* Subscription Status */}
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-6 h-6" style={{ color: NEON_MAGENTA }} />
                        <h3 className="text-xl font-bold uppercase text-white tracking-widest">SUBSCRIPTION_STATUS</h3>
                    </div>
                    <SubscriptionStatus
                        organizationId={organizationId}
                        tier={organization.subscription_tier || 'free'}
                        roomLimit={organization.room_limit || 5}
                        voterLimit={organization.voter_limit || 50}
                        roomsUsed={rooms.length}
                        expiresAt={organization.subscription_expires_at}
                        onUpgrade={() => setShowSubscriptionPicker(true)}
                    />
                </div>
            </div>

            {/* Subscription Picker Modal */}
            <SubscriptionPicker
                organizationId={organizationId}
                currentTier={organization.subscription_tier || 'free'}
                userId={userId}
                email={email}
                isOpen={showSubscriptionPicker}
                onClose={() => setShowSubscriptionPicker(false)}
                onSuccess={() => {
                    setShowSubscriptionPicker(false);
                    loadOrganization(); // Refresh org data
                }}
            />

            {/* Coin Purchase Modal */}
            <CoinsPurchaseModal
                userId={userId}
                email={email}
                isOpen={showCoinsModal}
                onClose={() => setShowCoinsModal(false)}
                onSuccess={() => {
                    setShowCoinsModal(false);
                }}
            />
        </div>
    );
}
