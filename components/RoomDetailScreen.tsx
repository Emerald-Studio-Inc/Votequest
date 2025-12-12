import { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Users, BarChart3, Play, Pause, Archive, Edit, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import VoterManagementPanel from './VoterManagementPanel';
import ShareRoomInvite from './ShareRoomInvite';
import CoinFeaturesPurchase from './CoinFeaturesPurchase';

interface RoomDetailScreenProps {
    roomId: string;
    organizationId: string;
    userId: string;
    onBack: () => void;
}

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner w-8 h-8" />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-mono-60 mb-4">Room not found</p>
                    <button onClick={onBack} className="btn btn-secondary">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const totalVotes = room.room_options?.reduce((sum: number, opt: any) => sum + (opt.votes_count || 0), 0) || 0;

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="max-w-[1200px] mx-auto px-8 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={onBack} className="btn btn-ghost flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        {/* Status Badge */}
                        <div className={`
              px-4 py-2 rounded-full text-sm font-medium
              ${room.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
              ${room.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : ''}
              ${room.status === 'closed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
              ${room.status === 'archived' ? 'bg-mono-20 text-mono-60 border border-mono-30' : ''}
            `}>
                            {room.status.toUpperCase()}
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">{room.title}</h1>
                    <p className="text-mono-60">{room.description}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        {room.status === 'draft' && (
                            <button
                                onClick={() => updateRoomStatus('active')}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <Play className="w-4 h-4" />
                                Activate Room
                            </button>
                        )}

                        {room.status === 'active' && (
                            <button
                                onClick={() => updateRoomStatus('closed')}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Pause className="w-4 h-4" />
                                Close Voting
                            </button>
                        )}

                        {room.status === 'closed' && (
                            <button
                                onClick={() => updateRoomStatus('archived')}
                                className="btn btn-ghost flex items-center gap-2"
                            >
                                <Archive className="w-4 h-4" />
                                Archive Room
                            </button>
                        )}

                        <button
                            className="btn btn-ghost flex items-center gap-2"
                            onClick={() => alert('Edit functionality coming soon!')}
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>

                        <button
                            onClick={() => setShowCoinFeatures(true)}
                            className="btn btn-ghost flex items-center gap-2 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                        >
                            <Zap className="w-4 h-4" />
                            Boost Room
                        </button>
                    </div>
                </div>
            </div>

            <CoinFeaturesPurchase
                roomId={roomId}
                userCoins={userCoins}
                isOpen={showCoinFeatures}
                onClose={() => setShowCoinFeatures(false)}
                onSuccess={() => {
                    loadRoom();
                    loadUserCoins(); // Refresh coins after purchase
                }}
            />

            {/* Tabs */}
            <div className="max-w-[1200px] mx-auto px-8 mt-8">
                <div className="flex gap-6 border-b border-white/10 mb-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'voters', label: 'Voters', icon: Users },
                        { id: 'results', label: 'Results', icon: CheckCircle }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                  pb-4 px-2 flex items-center gap-2 transition-all border-b-2
                  ${activeTab === tab.id
                                        ? 'border-white text-white'
                                        : 'border-transparent text-mono-60 hover:text-mono-80'
                                    }
                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Share Invite - Top Priority */}
                        {room.status === 'active' && (
                            <ShareRoomInvite
                                roomId={roomId}
                                roomTitle={room.title}
                            />
                        )}
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="card-elevated p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Users className="w-5 h-5 text-mono-70" />
                                    <p className="text-caption text-mono-60 uppercase">Total Votes</p>
                                </div>
                                <p className="text-3xl font-bold">{totalVotes}</p>
                            </div>

                            <div className="card-elevated p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-mono-70" />
                                    <p className="text-caption text-mono-60 uppercase">Options</p>
                                </div>
                                <p className="text-3xl font-bold">{room.room_options?.length || 0}</p>
                            </div>

                            <div className="card-elevated p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-mono-70" />
                                    <p className="text-caption text-mono-60 uppercase">Verification</p>
                                </div>
                                <p className="text-lg font-bold capitalize">{room.verification_tier.replace('tier', 'Tier ')}</p>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="card-elevated p-6">
                            <h3 className="text-heading mb-4">Room Settings</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-mono-60">Verification Level</span>
                                    <span className="font-medium">{room.verification_tier === 'tier1' ? 'Email Only' : room.verification_tier === 'tier2' ? 'Email + ID' : 'Email + Gov ID'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-mono-60">Public Visibility</span>
                                    <span className="font-medium">{room.is_public ? 'Public' : 'Private'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-mono-60">Anonymous Voting</span>
                                    <span className="font-medium">{room.allow_anonymous ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                        {/* Candidates / Options Preview */}
                        <div className="card-elevated p-6">
                            <h3 className="text-heading mb-4">Candidates</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {room.room_options?.map((option: any) => (
                                    <div key={option.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${!option.image_url ? 'bg-white/10' : ''}`}>
                                            {option.image_url ? (
                                                <img
                                                    src={option.image_url}
                                                    alt={option.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Users className="w-5 h-5 text-mono-50" />
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-white mb-1">{option.title}</h4>
                                            {option.description && (
                                                <p className="text-sm text-mono-60 line-clamp-3">{option.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Voters Tab */}
                {activeTab === 'voters' && (
                    <VoterManagementPanel
                        roomId={roomId}
                        verificationTier={room.verification_tier}
                        voters={voters}
                        onRefresh={loadVoters}
                    />
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="space-y-4">
                        {room.room_options?.map((option: any, index: number) => {
                            const percentage = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;

                            return (
                                <div key={option.id} className="card-elevated p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Candidate Image */}
                                            {option.image_url && (
                                                <div className="w-16 h-16 rounded-full bg-white/5 overflow-hidden border border-white/10 flex-shrink-0">
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
                                                <h4 className="font-bold text-lg mb-1">{option.title}</h4>
                                                {option.description && (
                                                    <p className="text-sm text-mono-60 line-clamp-2">{option.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold">{percentage}%</p>
                                            <p className="text-sm text-mono-60">{option.votes_count} votes</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white/30 transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {totalVotes === 0 && (
                            <div className="card-elevated p-12 text-center">
                                <XCircle className="w-12 h-12 text-mono-50 mx-auto mb-4" />
                                <p className="text-mono-60">No votes yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
