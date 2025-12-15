import { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Users, BarChart3, Play, Pause, Archive, Edit, CheckCircle, XCircle, Clock, Zap, Shield, Eye, EyeOff, Lock, Share2 } from 'lucide-react';
import VoterManagementPanel from './VoterManagementPanel';
import ShareRoomInvite from './ShareRoomInvite';
import CoinFeaturesPurchase from './CoinFeaturesPurchase';
import EditRoomModal from './EditRoomModal';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface RoomDetailScreenProps {
    roomId: string;
    organizationId: string;
    userId: string;
    onBack: () => void;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

export default function RoomDetailScreen({
    roomId,
    organizationId,
    userId,
    onBack
}: RoomDetailScreenProps) {
    const [room, setRoom] = useState<any>(null);
    const [voters, setVoters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'voters' | 'results'>('overview');
    const [showCoinFeatures, setShowCoinFeatures] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [userCoins, setUserCoins] = useState(0);

    useEffect(() => {
        loadRoom();
        loadVoters();
        loadUserCoins();
    }, [roomId]);

    const loadUserCoins = async () => {
        try {
            const response = await fetch(`/api/users/${userId}/coins`);
            if (response.ok) {
                const data = await response.json();
                setUserCoins(data.coins || 0);
            }
        } catch (error) {
            console.error('Error loading user coins:', error);
        }
    };

    const loadRoom = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/rooms?roomId=${roomId}`);
            if (response.ok) {
                const data = await response.json();
                setRoom(data.room);
            }
        } catch (error) {
            console.error('Error loading room:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadVoters = async () => {
        try {
            const response = await fetch(`/api/rooms/${roomId}/voters`);
            if (response.ok) {
                const data = await response.json();
                setVoters(data.voters || []);
            }
        } catch (error) {
            console.error('Error loading voters:', error);
        }
    };

    const updateRoomStatus = async (newStatus: 'active' | 'closed' | 'archived') => {
        try {
            const response = await fetch(`/api/rooms/${roomId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                await loadRoom();
                // We'll replace default alert with something better later, but for now keep functionality
                alert(`Room ${newStatus === 'active' ? 'activated' : newStatus}!`);
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${NEON_CYAN}40`, borderTopColor: NEON_CYAN }}></div>
                    <p className="font-mono text-cyan-400 animate-pulse text-sm">ACCESSING_CHAMBER_DATA...</p>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center p-8 border border-red-900/50 bg-red-900/10 max-w-md">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="font-mono text-red-400 mb-6 uppercase">ERROR: CHAMBER_NOT_FOUND</p>
                    <ArcadeButton onClick={onBack} variant="cyan">
                        RETURN_TO_BASE
                    </ArcadeButton>
                </div>
            </div>
        );
    }

    const totalVotes = room.room_options?.reduce((sum: number, opt: any) => sum + (opt.votes_count || 0), 0) || 0;

    return (
        <div className="min-h-screen pb-32 relative bg-black font-mono overflow-auto custom-scrollbar">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl" style={{ borderBottom: `1px solid ${NEON_CYAN}30` }}>
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <ArcadeButton
                                onClick={onBack}
                                variant="cyan"
                                size="sm"
                                className="w-10 h-10 !p-0 flex items-center justify-center"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </ArcadeButton>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 px-3 py-1.5 border"
                                style={{
                                    borderColor: room.status === 'active' ? NEON_LIME : room.status === 'draft' ? '#EAB308' : NEON_MAGENTA,
                                    backgroundColor: room.status === 'active' ? `${NEON_LIME}10` : room.status === 'draft' ? '#EAB30810' : `${NEON_MAGENTA}10`
                                }}
                            >
                                <div className="w-2 h-2 rounded-full animate-pulse"
                                    style={{ backgroundColor: room.status === 'active' ? NEON_LIME : room.status === 'draft' ? '#EAB308' : NEON_MAGENTA }}
                                />
                                <span className="text-xs font-bold uppercase tracking-wider"
                                    style={{ color: room.status === 'active' ? NEON_LIME : room.status === 'draft' ? '#EAB308' : NEON_MAGENTA }}
                                >
                                    STATUS: {room.status}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            {room.status === 'draft' && (
                                <ArcadeButton
                                    onClick={() => updateRoomStatus('active')}
                                    variant="cyan"
                                    className="flex items-center gap-2"
                                >
                                    <Play className="w-4 h-4" />
                                    <span>ACTIVATE_PROTOCOL</span>
                                </ArcadeButton>
                            )}

                            {room.status === 'active' && (
                                <ArcadeButton
                                    onClick={() => updateRoomStatus('closed')}
                                    variant="magenta"
                                    className="flex items-center gap-2"
                                >
                                    <Pause className="w-4 h-4" />
                                    <span>HALT_VOTING</span>
                                </ArcadeButton>
                            )}

                            {room.status === 'closed' && (
                                <ArcadeButton
                                    onClick={() => updateRoomStatus('archived')}
                                    variant="cyan"
                                    className="flex items-center gap-2"
                                >
                                    <Archive className="w-4 h-4" />
                                    <span>ARCHIVE_DATA</span>
                                </ArcadeButton>
                            )}

                            <ArcadeButton
                                onClick={() => setShowEditModal(true)}
                                variant="cyan"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                <span>CONFIG</span>
                            </ArcadeButton>

                            <ArcadeButton
                                onClick={() => setShowCoinFeatures(true)}
                                variant="lime"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                <span>BOOST_CHAMBER</span>
                            </ArcadeButton>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase tracking-wider text-white glitch-text" data-text={room.title}>
                        {room.title}
                    </h1>
                    <p className="text-gray-400 font-mono text-sm border-l-2 pl-4 max-w-3xl" style={{ borderColor: NEON_CYAN }}>
                        {'>'} {room.description}
                    </p>
                </div>
            </div>

            <EditRoomModal
                roomId={roomId}
                userId={userId}
                initialTitle={room.title}
                initialDescription={room.description || ''}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    loadRoom();
                    setShowEditModal(false);
                }}
            />

            <CoinFeaturesPurchase
                roomId={roomId}
                userCoins={userCoins}
                userId={userId}
                isOpen={showCoinFeatures}
                onClose={() => setShowCoinFeatures(false)}
                onSuccess={() => {
                    loadRoom();
                    loadUserCoins();
                }}
            />

            {/* Tabs */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-8 relative z-10">
                <div className="flex gap-1 border-b mb-8 overflow-x-auto pb-2 scrollbar-hide" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {[
                        { id: 'overview', label: 'SYSTEM_OVERVIEW', icon: BarChart3 },
                        { id: 'voters', label: 'PARTICIPANTS', icon: Users },
                        { id: 'results', label: 'FEED_DATA', icon: CheckCircle }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                  py-3 px-6 flex items-center gap-2 transition-all border-b-2 font-mono text-sm uppercase tracking-wider
                                  ${isActive
                                        ? 'text-white bg-white/5'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }
                                `}
                                style={{
                                    borderColor: isActive ? NEON_CYAN : 'transparent',
                                    color: isActive ? NEON_CYAN : undefined
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-slide-up">
                        {/* Share Invite - Top Priority */}
                        {room.status === 'active' && (
                            <ShareRoomInvite
                                roomId={roomId}
                                roomTitle={room.title}
                            />
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <CyberCard className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 flex items-center justify-center border bg-black" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                        <Users className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase font-mono">TOTAL_INPUTS</p>
                                </div>
                                <p className="text-3xl font-bold text-white font-mono">{totalVotes}</p>
                            </CyberCard>

                            <CyberCard className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 flex items-center justify-center border bg-black" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase font-mono">DECISION_NODES</p>
                                </div>
                                <p className="text-3xl font-bold text-white font-mono">{room.room_options?.length || 0}</p>
                            </CyberCard>

                            <CyberCard className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 flex items-center justify-center border bg-black" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                        <Shield className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase font-mono">SECURITY_LEVEL</p>
                                </div>
                                <p className="text-xl font-bold text-white font-mono uppercase">{room.verification_tier.replace('tier', 'LEVEL_')}</p>
                            </CyberCard>
                        </div>

                        {/* Settings */}
                        <CyberCard className="p-6" title="SYSTEM_PARAMETERS" cornerStyle="tech">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border bg-black/40" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-300 font-mono uppercase">VERIFICATION_PROTOCOL</span>
                                    </div>
                                    <span className="text-sm font-bold text-white uppercase font-mono">
                                        {room.verification_tier === 'tier1' ? 'EMAIL_ONLY' : room.verification_tier === 'tier2' ? 'EMAIL_PLUS_ID' : 'FULL_KYC'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 border bg-black/40" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                    <div className="flex items-center gap-3">
                                        {room.is_public ? <Eye className="w-5 h-5 text-gray-400" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                                        <span className="text-sm text-gray-300 font-mono uppercase">VISIBILITY_MODE</span>
                                    </div>
                                    <span className="text-sm font-bold text-white uppercase font-mono">
                                        {room.is_public ? 'PUBLIC_ACCESS' : 'RESTRICTED_ACCESS'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 border bg-black/40" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-300 font-mono uppercase">ANONYMITY_LAYER</span>
                                    </div>
                                    <span className="text-sm font-bold text-white uppercase font-mono">
                                        {room.allow_anonymous ? 'ENABLED' : 'DISABLED'}
                                    </span>
                                </div>
                            </div>
                        </CyberCard>

                        {/* Candidates / Options Preview */}
                        <CyberCard className="p-6" title="CANDIDATE_ENTITIES" cornerStyle="tech">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {room.room_options?.map((option: any) => (
                                    <div key={option.id} className="p-4 bg-white/[0.02] border flex items-start gap-4 transition-colors hover:bg-white/[0.05]" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                        {/* Avatar */}
                                        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden border bg-black" style={{ borderColor: NEON_CYAN }}>
                                            {option.image_url ? (
                                                <img
                                                    src={option.image_url}
                                                    alt={option.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Users className="w-5 h-5" style={{ color: NEON_CYAN }} />
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-white mb-1 uppercase font-mono text-sm tracking-wide">{option.title}</h4>
                                            {option.description && (
                                                <p className="text-xs text-gray-500 font-mono line-clamp-2">{option.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CyberCard>
                    </div>
                )}

                {/* Voters Tab */}
                {activeTab === 'voters' && (
                    <div className="animate-slide-up">
                        <VoterManagementPanel
                            roomId={roomId}
                            verificationTier={room.verification_tier}
                            voters={voters}
                            onRefresh={loadVoters}
                        />
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="space-y-4 animate-slide-up">
                        {room.room_options?.map((option: any, index: number) => {
                            const percentage = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;

                            return (
                                <CyberCard key={option.id} className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Candidate Image */}
                                            {option.image_url && (
                                                <div className="w-16 h-16 bg-black overflow-hidden border flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                                    <img
                                                        src={option.image_url}
                                                        alt={option.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg mb-1 uppercase text-white tracking-wide">{option.title}</h4>
                                                {option.description && (
                                                    <p className="text-xs text-gray-500 font-mono line-clamp-2">{option.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold font-mono text-white" style={{ textShadow: `0 0 10px ${NEON_CYAN}` }}>{percentage}%</p>
                                            <p className="text-xs text-gray-500 font-mono uppercase">{option.votes_count} VOTES_LOGGED</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-gray-900 border border-white/10 overflow-hidden relative">
                                        <div
                                            className="h-full transition-all duration-500 relative"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: NEON_CYAN,
                                                boxShadow: `0 0 10px ${NEON_CYAN}`
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </CyberCard>
                            );
                        })}

                        {totalVotes === 0 && (
                            <CyberCard className="p-12 text-center">
                                <XCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 font-mono uppercase">NO_DATA_STREAMS_DETECTED</p>
                            </CyberCard>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
