import React from 'react';
import { LayoutDashboard, FileText, Vote, Search, Coins, User, Wallet } from 'lucide-react';

interface SidebarProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
    isConnected: boolean;
    onConnect: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, isConnected, onConnect }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'proposals', label: 'Proposals', icon: FileText },
        { id: 'my-votes', label: 'My Votes', icon: Vote },
        { id: 'explorer', label: 'Blockchain Explorer', icon: Search },
        { id: 'staking', label: 'Staking', icon: Coins },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="16" width="16" height="4" rx="2" fill="#fbbf24" />
                        <rect x="12" y="8" width="8" height="8" rx="2" transform="rotate(45 16 12)" fill="#fbbf24" />
                    </svg>
                </div>
                <span className="logo-text">VoteQuest</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentScreen === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon className="sidebar-nav-icon" size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Connect Wallet Button */}
            {!isConnected && (
                <div className="sidebar-footer">
                    <button onClick={onConnect} className="btn-connect-wallet">
                        <Wallet size={20} />
                        <span>Connect Wallet</span>
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
