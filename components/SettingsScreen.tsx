import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, LogOut, ChevronRight, Check, X, AlertCircle, ExternalLink, Cpu } from 'lucide-react';
import Tooltip from './Tooltip';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface SettingItem {
    label: string;
    value: string;
    description?: string;
    action?: () => void | Promise<void>;
    actionLabel?: string;
}

interface SettingsScreenProps {
    userData: any;
    onNavigate?: (screen: string) => void;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ userData, onNavigate }) => {
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const [notifications, setNotifications] = useState({
        proposals: true,
        votes: true,
        achievements: true,
        updates: false
    });

    const handleDisconnect = () => {
        // Clear local storage and reload
        localStorage.clear();
        window.location.reload();
        setShowDisconnectConfirm(false);
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const settingsSections: { title: string; icon: any; items: SettingItem[] }[] = [
        {
            title: 'ACCOUNT_CONFIG',
            icon: User,
            items: [
                {
                    label: 'WALLET_ADDRESS',
                    value: userData.address ? `${userData.address.slice(0, 6)}...${userData.address.slice(-4)}` : 'DISCONNECTED',
                    action: () => navigator.clipboard.writeText(userData.address || ''),
                    actionLabel: 'COPY_DATA'
                },
                {
                    label: 'OPERATOR_ID',
                    value: userData.userId ? `${userData.userId.slice(0, 8)}...` : 'N/A',
                    action: () => navigator.clipboard.writeText(userData.userId || ''),
                    actionLabel: 'COPY_ID'
                }
            ]
        },
        {
            title: 'SECURITY_PROTOCOL',
            icon: Shield,
            items: [
                {
                    label: 'DATA_COLLECTION',
                    value: 'MINIMAL',
                    description: 'Only essential voting data collected'
                },
                {
                    label: 'BLOCKCHAIN_LEDGER',
                    value: 'PUBLIC_VERIFIABLE',
                    description: 'All votes verified on-chain'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen pb-32 relative">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl" style={{ borderBottom: `1px solid ${NEON_CYAN}30` }}>
                <div className="max-w-[900px] mx-auto px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-widest text-white glitch-text" data-text="SETTINGS">Settings</h1>
                        <p className="text-xs font-mono text-gray-400 mt-1 uppercase">
                            {'>'} CONFIGURE_SYSTEM_PARAMETERS
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[900px] mx-auto px-8 pt-12 relative z-10">

                {/* Profile Card */}
                <CyberCard className="mb-12" title="PILOT_PROFILE" cornerStyle="tech">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div
                                className="w-24 h-24 flex items-center justify-center relative bg-black"
                                style={{ border: `1px solid ${NEON_CYAN}` }}
                            >
                                <div className="absolute inset-0 bg-white/5 opacity-50" />
                                <User className="w-10 h-10" style={{ color: NEON_CYAN }} />

                                {/* Tech frame */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: NEON_CYAN }} />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: NEON_CYAN }} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-black border border-white p-1">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-2 uppercase tracking-wider text-white">
                                {userData.address ? `${userData.address.slice(0, 6)}...${userData.address.slice(-4)}` : 'UNKNOWN_VOTER'}
                            </h2>
                            <p className="text-xs font-mono text-gray-300 mb-6 uppercase">
                                REGISTERED_SINCE: {new Date().toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 p-4 bg-white/5 border border-white/10">
                                <div>
                                    <p className="text-[10px] text-gray-300 font-mono uppercase mb-1">ACCESS_LEVEL</p>
                                    <p className="text-xl font-bold font-mono text-white">{userData.level}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-mono uppercase mb-1">VOTES_LOGGED</p>
                                    <p className="text-xl font-bold font-mono text-white">{userData.votesCount}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-mono uppercase mb-1">RANKING</p>
                                    <p className="text-xl font-bold font-mono" style={{ color: NEON_MAGENTA }}>#{userData.globalRank}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CyberCard>

                {/* Notifications Settings */}
                <CyberCard className="mb-8" title="COMM_CHANNELS">
                    <div className="space-y-1">
                        {Object.entries({
                            proposals: 'NEW_PROPOSALS',
                            votes: 'VOTE_CONFIRMATIONS',
                            achievements: 'ACHIEVEMENT_UNLOCKS',
                            updates: 'SYSTEM_UPDATES'
                        }).map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                <div>
                                    <p className="text-sm font-bold text-gray-300 font-mono mb-1 group-hover:text-white transition-colors">{label}</p>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase">
                                        {key === 'proposals' && '> ALERT_ON_NEW_MISSION'}
                                        {key === 'votes' && '> CONFIRM_TRANSACTIONS'}
                                        {key === 'achievements' && '> REWARD_NOTIFICATIONS'}
                                        {key === 'updates' && '> PATCH_NOTES'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => toggleNotification(key as keyof typeof notifications)}
                                    className="relative w-10 h-5 transition-all duration-300"
                                    style={{
                                        backgroundColor: notifications[key as keyof typeof notifications] ? `${NEON_CYAN}30` : '#1F2937',
                                        border: `1px solid ${notifications[key as keyof typeof notifications] ? NEON_CYAN : '#374151'}`
                                    }}
                                >
                                    <div
                                        className="absolute top-0.5 w-3.5 h-3.5 transition-all duration-300"
                                        style={{
                                            left: notifications[key as keyof typeof notifications] ? 'calc(100% - 1.1rem)' : '0.1rem',
                                            backgroundColor: notifications[key as keyof typeof notifications] ? NEON_CYAN : '#4B5563'
                                        }}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </CyberCard>

                {/* Settings Sections */}
                <div className="space-y-8">
                    {settingsSections.map((section, sectionIndex) => {
                        const Icon = section.icon;
                        return (
                            <CyberCard key={sectionIndex} title={section.title}>
                                <div className="space-y-1">
                                    {section.items.map((item, itemIndex) => (
                                        <div
                                            key={itemIndex}
                                            className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-300 font-mono mb-1">{item.label}</p>
                                                <p className="text-[10px] font-mono text-gray-500 uppercase" style={{ color: item.value !== 'Not connected' && item.value !== 'N/A' ? NEON_CYAN : undefined }}>
                                                    {item.value}
                                                </p>
                                                {item.description && (
                                                    <p className="text-[10px] text-gray-600 mt-1 font-mono uppercase">{'>'} {item.description}</p>
                                                )}
                                            </div>
                                            {item.action && (
                                                <Tooltip content={item.actionLabel || 'Action'} position="left">
                                                    <ArcadeButton
                                                        onClick={item.action}
                                                        variant="secondary"
                                                        size="sm"
                                                        className="text-[10px] py-1 h-auto"
                                                    >
                                                        [{item.actionLabel}]
                                                    </ArcadeButton>
                                                </Tooltip>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CyberCard>
                        );
                    })}
                </div>

                {/* Resources Section */}
                <CyberCard className="mt-8" title="DATABASE_ACCESS">
                    <div className="space-y-1">
                        {[
                            { label: 'SYSTEM_MANUAL', url: '#' },
                            { label: 'TERMS_OF_SERVICE', url: '#' },
                            { label: 'PRIVACY_PROTOCOL', url: '#' },
                            { label: 'TECH_SUPPORT', url: '#' }
                        ].map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                            >
                                <span className="text-sm font-bold text-gray-300 font-mono group-hover:text-white">{link.label}</span>
                                <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
                            </a>
                        ))}
                    </div>
                </CyberCard>

                {/* Danger Zone */}
                <div
                    className="p-8 mt-8 border bg-black/50 relative overflow-hidden group"
                    style={{ borderColor: `${NEON_MAGENTA}50` }}
                >
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-start gap-4 mb-6 relative z-10">
                        <div className="w-10 h-10 flex items-center justify-center border" style={{ borderColor: NEON_MAGENTA }}>
                            <AlertCircle className="w-5 h-5" style={{ color: NEON_MAGENTA }} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: NEON_MAGENTA }}>TERMINATE_CONNECTION</h3>
                            <p className="text-xs text-gray-500 font-mono">
                                {'>'} WARNING: Disconnecting will terminate session.
                                <br />{'>'} Blockchain data remains immutable.
                            </p>
                        </div>
                    </div>

                    <ArcadeButton
                        variant="magenta"
                        onClick={() => setShowDisconnectConfirm(true)}
                        className="w-full relative z-10"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        INITIATE_DISCONNECT
                    </ArcadeButton>
                </div>
            </div>

            {/* Disconnect Confirmation Modal */}
            {
                showDisconnectConfirm && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center px-6 animate-fade-in">
                        <div
                            className="max-w-md w-full p-8 bg-black border relative animate-scale-in"
                            style={{ borderColor: NEON_MAGENTA, boxShadow: `0 0 30px ${NEON_MAGENTA}20` }}
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 flex items-center justify-center border" style={{ borderColor: NEON_MAGENTA }}>
                                    <AlertCircle className="w-6 h-6 animate-pulse" style={{ color: NEON_MAGENTA }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-wider mb-2 text-white">CONFIRM_TERMINATION</h3>
                                    <p className="text-xs text-gray-400 font-mono">
                                        {'>'} Are you sure you want to disconnect?
                                        <br />{'>'} Re-authentication required for access.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <ArcadeButton
                                    onClick={() => setShowDisconnectConfirm(false)}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    [ CANCEL ]
                                </ArcadeButton>
                                <ArcadeButton
                                    variant="magenta"
                                    onClick={handleDisconnect}
                                    className="flex-1"
                                >
                                    CONFIRM
                                </ArcadeButton>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default SettingsScreen;
