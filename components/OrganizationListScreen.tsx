import { useState, useEffect } from 'react';
import { Building2, Plus, Users, ChevronRight, Vote } from 'lucide-react';
import CyberButton from './CyberButton';
import CyberCard from './CyberCard';

interface OrganizationListScreenProps {
    userId: string;
    onSelectOrganization: (orgId: string) => void;
    onCreateNew: () => void;
    onBack: () => void;
}

export default function OrganizationListScreen({
    userId,
    onSelectOrganization,
    onCreateNew,
    onBack
}: OrganizationListScreenProps) {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrganizations();
    }, [userId]);

    const loadOrganizations = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/organizations?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setOrganizations(data.organizations || []);
                // Log removed('Loaded organizations:', data.organizations);
            }
        } catch (error) {
            console.error('Error loading organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="max-w-[1200px] mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <button onClick={onBack} className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors">
                            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                                <Vote className="w-4 h-4 text-black" strokeWidth={2.5} />
                            </div>
                            <span className="font-bold tracking-wider">VOTEQUEST</span>
                        </button>
                        <CyberButton onClick={onCreateNew} className="!py-1.5 !px-3">
                            <Plus className="w-4 h-4 mr-2 inline-block" />
                            CREATE_ORG
                        </CyberButton>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1200px] mx-auto px-8 pt-12">
                <div className="mb-8">
                    <h1 className="text-display mb-2">Your Organizations</h1>
                    <p className="text-body text-mono-60">
                        Select an organization to manage voting rooms
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="loading-spinner w-8 h-8" />
                    </div>
                ) : organizations.length === 0 ? (
                    <div className="card-elevated p-12 text-center">
                        <Building2 className="w-12 h-12 text-mono-50 mx-auto mb-4" />
                        <h3 className="text-heading mb-2">No Organizations Yet</h3>
                        <p className="text-mono-60 mb-6">
                            Create your first organization to start managing voting rooms
                        </p>
                        <CyberButton onClick={onCreateNew} className="mx-auto">
                            <Plus className="w-4 h-4 mr-2 inline-block" />
                            CREATE_FIRST_ORG
                        </CyberButton>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {organizations.map((org) => (
                            <div
                                key={org.id}
                                onClick={() => onSelectOrganization(org.id)}
                                className="card-elevated p-6 cursor-pointer group hover:border-white/20 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{org.name}</h3>
                                                <p className="text-sm text-mono-60 capitalize">
                                                    {org.type} • {org.subscription_tier} tier
                                                </p>
                                            </div>
                                        </div>

                                        {org.domain && (
                                            <p className="text-sm text-mono-50 mt-3">
                                                📧 {org.domain}
                                            </p>
                                        )}

                                        <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                                            <div>
                                                <p className="text-xs text-mono-60 uppercase">Rooms</p>
                                                <p className="text-sm font-medium">{org.room_limit || 10}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-mono-60 uppercase">Voters</p>
                                                <p className="text-sm font-medium">{org.voter_limit || 100}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-mono-50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
