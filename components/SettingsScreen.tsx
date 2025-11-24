import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, LogOut, ChevronRight, Check, X, AlertCircle, ExternalLink } from 'lucide-react';
import { useDisconnect } from 'wagmi';
import Tooltip from './Tooltip';

interface SettingItem {
    label: string;
    value: string;
    description?: string;
    action?: () => void | Promise<void>;
    actionLabel?: string;
}

interface SettingsScreenProps {
    userData: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ userData }) => {
    const { disconnect } = useDisconnect();
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const [notifications, setNotifications] = useState({
        proposals: true,
        votes: true,
        achievements: true,
        updates: false
    });

    const handleDisconnect = () => {
        disconnect();
        setShowDisconnectConfirm(false);
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const settingsSections: { title: string; icon: any; items: SettingItem[] }[] = [
        {
            title: 'Account',
            icon: User,
            items: [
                {
                    label: 'Wallet Address',
                    value: userData.address ? `${userData.address.slice(0, 6)}...${userData.address.slice(-4)}` : 'Not connected',
                    action: () => navigator.clipboard.writeText(userData.address || ''),
                    actionLabel: 'Copy'
                },
                {
                    label: 'User ID',
                    value: userData.userId ? `${userData.userId.slice(0, 8)}...` : 'N/A',
                    action: () => navigator.clipboard.writeText(userData.userId || ''),
                    actionLabel: 'Copy'
                }
            ]
        },
        {
            title: 'Privacy & Security',
            icon: Shield,
            items: [
                {
                    label: 'Data Collection',
                    value: 'Minimal',
                    description: 'We only collect essential voting data'
                },
                {
                    label: 'Blockchain Transparency',
                    value: 'Public',
                    description: 'All votes are publicly verifiable'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen pb-32 relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px] animate-float" style={{ animationDuration: '10s' }}></div>
            </div>

            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-[900px] mx-auto px-8 py-6">
                    <div>
                        <h1 className="text-display mb-2">Settings</h1>
                        <p className="text-body text-mono-60">
                            Manage your account preferences and security
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[900px] mx-auto px-8 pt-12 relative z-10">

                {/* Profile Card */}
                <div className="card-elevated p-8 mb-12 animate-slide-up">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-all">
                                <User className="w-12 h-12 text-mono-70" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-green-500/20 border-2 border-black flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-400" strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h2 className="text-heading mb-2">
                                {userData.address ? `${userData.address.slice(0, 6)}...${userData.address.slice(-4)}` : 'Voter'}
                            </h2>
                            <p className="text-body text-mono-60 mb-4">
                                Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-caption text-mono-50 uppercase mb-1">Level</p>
                                    <p className="text-xl font-bold">{userData.level}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10"></div>
                                <div>
                                    <p className="text-caption text-mono-50 uppercase mb-1">Votes Cast</p>
                                    <p className="text-xl font-bold">{userData.votesCount}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10"></div>
                                <div>
                                    <p className="text-caption text-mono-50 uppercase mb-1">Global Rank</p>
                                    <p className="text-xl font-bold">#{userData.globalRank}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Settings */}
                <div className="card-elevated p-8 mb-8 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-mono-70" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-heading mb-1">Notifications</h3>
                            <p className="text-caption text-mono-60">Manage your notification preferences</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {Object.entries({
                            proposals: 'New Proposals',
                            votes: 'Vote Confirmations',
                            achievements: 'Achievement Unlocks',
                            updates: 'Platform Updates'
                        }).map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-fast">
                                <div>
                                    <p className="text-sm font-medium text-mono-95 mb-1">{label}</p>
                                    <p className="text-caption text-mono-60">
                                        {key === 'proposals' && 'Get notified when new proposals are created'}
                                        {key === 'votes' && 'Receive confirmations for your votes'}
                                        {key === 'achievements' && 'Celebrate when you unlock achievements'}
                                        {key === 'updates' && 'Stay informed about platform changes'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => toggleNotification(key as keyof typeof notifications)}
                                    className={`
                                        relative w-12 h-6 rounded-full transition-all
                                        ${notifications[key as keyof typeof notifications]
                                            ? 'bg-white'
                                            : 'bg-white/10'
                                        }
                                    `}
                                >
                                    <div className={`
                                        absolute top-1 w-4 h-4 rounded-full transition-all
                                        ${notifications[key as keyof typeof notifications]
                                            ? 'left-7 bg-black'
                                            : 'left-1 bg-mono-50'
                                        }
                                    `}></div>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {settingsSections.map((section, sectionIndex) => {
                        const Icon = section.icon;
                        return (
                            <div key={sectionIndex} className="card-elevated p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-mono-70" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-heading">{section.title}</h3>
                                </div>

                                <div className="space-y-3">
                                    {section.items.map((item, itemIndex) => (
                                        <div
                                            key={itemIndex}
                                            className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-fast group"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-mono-95 mb-1">{item.label}</p>
                                                <p className="text-caption text-mono-60">{item.value}</p>
                                                {item.description && (
                                                    <p className="text-caption text-mono-50 mt-1">{item.description}</p>
                                                )}
                                            </div>
                                            {item.action && (
                                                <Tooltip content={item.actionLabel || 'Action'} position="left">
                                                    <button
                                                        onClick={item.action}
                                                        className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        {item.actionLabel}
                                                    </button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Links Section */}
                <div className="card-elevated p-8 my-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-mono-70" strokeWidth={2} />
                        </div>
                        <h3 className="text-heading">Resources</h3>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: 'Documentation', url: '#' },
                            { label: 'Terms of Service', url: '#' },
                            { label: 'Privacy Policy', url: '#' },
                            { label: 'Support', url: '#' }
                        ].map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-fast group"
                            >
                                <span className="text-sm font-medium text-mono-95">{link.label}</span>
                                <ExternalLink className="w-4 h-4 text-mono-50 group-hover:text-mono-95 transition-fast" strokeWidth={2} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="card p-8 border-red-500/20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-red-400" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-heading text-red-400 mb-2">Disconnect Wallet</h3>
                            <p className="text-body-small text-mono-60">
                                Disconnecting will log you out and remove your session. Your blockchain data remains secure and unchanged.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowDisconnectConfirm(true)}
                        className="btn btn-danger w-full"
                    >
                        <LogOut className="w-4 h-4" strokeWidth={2} />
                        <span>Disconnect Wallet</span>
                    </button>
                </div>
            </div>

            {/* Disconnect Confirmation Modal */}
            {showDisconnectConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center px-6 animate-fade-in">
                    <div className="card-elevated p-8 max-w-md w-full animate-scale-bounce">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-400" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-heading mb-2">Disconnect Wallet?</h3>
                                <p className="text-body text-mono-60">
                                    Are you sure you want to disconnect your wallet? You'll need to reconnect to access your account.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDisconnectConfirm(false)}
                                className="btn btn-secondary flex-1"
                            >
                                <X className="w-4 h-4" strokeWidth={2} />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleDisconnect}
                                className="btn btn-danger flex-1"
                            >
                                <Check className="w-4 h-4" strokeWidth={2} />
                                <span>Disconnect</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsScreen;
