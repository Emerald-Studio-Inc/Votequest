import React from 'react';
import { Wallet, Network, Bell, Globe, Info, ExternalLink, Copy, LogOut, ChevronRight } from 'lucide-react';
import { useDisconnect, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { VOTE_QUEST_ADDRESS } from '@/lib/contracts';
import Tooltip from './Tooltip';

interface SettingsScreenProps {
    userData: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ userData }) => {
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();

    const copyAddress = () => {
        if (userData.address) {
            navigator.clipboard.writeText(userData.address);
            // Could add a toast notification here
        }
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="min-h-screen pb-32 animate-fade-in">
            {/* Header */}
            <div className="relative z-10 pt-16 pb-6 px-6">
                <h1 className="text-3xl font-light text-white tracking-tight mb-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>Settings</h1>
                <p className="text-zinc-500 text-sm font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>Manage your account and preferences</p>
            </div>

            <div className="relative z-10 px-6 space-y-8">
                {/* Account Section */}
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-zinc-500 text-[10px] uppercase tracking-widest mb-3 pl-2">Account</h2>
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <Wallet className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                                <div className="text-zinc-400 text-xs font-light">Connected Wallet</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-white font-mono text-sm tracking-wide">
                                    {userData.address ? truncateAddress(userData.address) : 'Not connected'}
                                </div>
                                {userData.address && (
                                    <Tooltip content="Copy Address" position="left">
                                        <button
                                            onClick={copyAddress}
                                            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" strokeWidth={1.5} />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>
                        </div>

                        <Tooltip content="Disconnect your wallet" position="bottom">
                            <button
                                onClick={() => disconnect()}
                                className="w-full p-5 flex items-center justify-between hover:bg-red-500/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut className="w-4 h-4 text-red-500/70 group-hover:text-red-500 transition-colors" strokeWidth={1.5} />
                                    <div className="text-red-500/70 group-hover:text-red-500 text-sm font-light transition-colors">Disconnect Wallet</div>
                                </div>
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Network Section */}
                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <h2 className="text-zinc-500 text-[10px] uppercase tracking-widest mb-3 pl-2">Network</h2>
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <Network className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                                <div className="text-zinc-400 text-xs font-light">Current Network</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                                <div className="text-white text-sm font-light">Polygon Amoy Testnet</div>
                            </div>
                        </div>

                        <Tooltip content="Switch to Polygon Amoy" position="bottom">
                            <button
                                onClick={() => switchChain({ chainId: polygonAmoy.id })}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-zinc-400 group-hover:text-white text-sm font-light transition-colors">Switch Network</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-zinc-500 text-[10px] uppercase tracking-widest mb-3 pl-2">Preferences</h2>
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                                <div className="text-white text-sm font-light">Notifications</div>
                            </div>
                            <Tooltip content="Toggle Notifications" position="left">
                                <button className="w-10 h-5 bg-zinc-800 rounded-full relative transition-colors hover:bg-zinc-700">
                                    <div className="w-3 h-3 bg-zinc-500 rounded-full absolute left-1 top-1"></div>
                                </button>
                            </Tooltip>
                        </div>

                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                                <div className="text-white text-sm font-light">Language</div>
                            </div>
                            <select className="bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-white text-xs font-light focus:outline-none cursor-pointer hover:bg-black/40 transition-colors">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <h2 className="text-zinc-500 text-[10px] uppercase tracking-widest mb-3 pl-2">About</h2>
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <Info className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                                <div className="text-zinc-400 text-xs font-light">App Version</div>
                            </div>
                            <div className="text-white text-sm font-mono">v1.0.0</div>
                        </div>

                        <div className="p-5 border-b border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <Network className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                                <div className="text-zinc-400 text-xs font-light">Smart Contract</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-white font-mono text-xs tracking-wide opacity-80">
                                    {truncateAddress(VOTE_QUEST_ADDRESS)}
                                </div>
                                <Tooltip content="View on Explorer" position="left">
                                    <a
                                        href={`https://amoy.polygonscan.com/address/${VOTE_QUEST_ADDRESS}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" strokeWidth={1.5} />
                                    </a>
                                </Tooltip>
                            </div>
                        </div>

                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-zinc-400 group-hover:text-white text-sm font-light transition-colors">Documentation</div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
