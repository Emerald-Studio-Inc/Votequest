import { useState, useEffect } from 'react';
import { Building2, Plus, Users, Vote, Settings, BarChart3, Clock, ChevronRight } from 'lucide-react';
import SubscriptionStatus from './SubscriptionStatus';
import SubscriptionPicker from './SubscriptionPicker';
import OrganizationAdminLayout from './admin/OrganizationAdminLayout';
import TurnoutHeatmap from './analytics/TurnoutHeatmap';
import VoterDemographics from './analytics/VoterDemographics';

interface OrganizationDashboardProps {
    organizationId: string;
    userId: string;
    email: string;
    onNavigate?: (screen: string, data?: any) => void;
}

export default function OrganizationDashboard({
    organizationId,
    userId,
    email,
    onNavigate
}: OrganizationDashboardProps) {
    const [organization, setOrganization] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSubscriptionPicker, setShowSubscriptionPicker] = useState(false);

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
                console.log('Loaded rooms:', data.rooms);
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!organization) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 relative">
            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="max-w-[1200px] mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate?.('organization-list')}
                                className="btn btn-ghost flex items-center gap-2"
                                title="Back to Organizations"
                            >
                                <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                                    <Vote className="w-4 h-4 text-black" strokeWidth={2.5} />
                                </div>
                                <span className="font-bold">VoteQuest</span>
                            </button>
                            <div className="h-6 w-px bg-white/10"></div>
                            <div>
                                <h1 className="text-xl font-bold">{organization.name}</h1>
                                <p className="text-sm text-mono-60 capitalize">
                                    {organization.type} • {organization.subscription_tier} tier
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onNavigate?.('create-room')}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Room
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1200px] mx-auto px-8 pt-12">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <div className="card-elevated p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Vote className="w-5 h-5 text-mono-70" />
                            <p className="text-caption text-mono-60 uppercase">Active Rooms</p>
                        </div>
                        <p className="text-3xl font-bold">{rooms.filter(r => r.status === 'active').length}</p>
                    </div>

                    <div className="card-elevated p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-mono-70" />
                            <p className="text-caption text-mono-60 uppercase">Total Voters</p>
                        </div>
                        <p className="text-3xl font-bold">0</p>
                    </div>

                    <div className="card-elevated p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-mono-70" />
                            <p className="text-caption text-mono-60 uppercase">Turnout Rate</p>
                        </div>
                        <p className="text-3xl font-bold">-%</p>
                    </div>
                </div>

                {/* Rooms List */}
                <div className="card-elevated p-8">
                    <h3 className="text-heading mb-6">Voting Rooms</h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="loading-spinner w-6 h-6" />
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-12">
                            <Vote className="w-12 h-12 text-mono-50 mx-auto mb-4" />
                            <p className="text-mono-60 mb-4">No voting rooms yet</p>
                            <button
                                onClick={() => onNavigate?.('create-room')}
                                className="btn btn-primary"
                            >
                                Create Your First Room
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-fast cursor-pointer"
                                    onClick={() => onNavigate?.('room', room)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-white mb-1">{room.title}</h4>
                                            <p className="text-sm text-mono-60">{room.description}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${room.status === 'active' ? 'bg-green-500/20 text-green-400' : ''} ${room.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' : ''} ${room.status === 'closed' ? 'bg-mono-20 text-mono-60' : ''}`}>
                                            {room.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Subscription Status */}
                <div className="mt-12">
                    <h3 className="text-heading mb-6">Subscription & Billing</h3>
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
        </div>
    );
}
