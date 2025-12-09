import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Zap, Plus } from 'lucide-react';
import NotificationBell from './NotificationBell';
import CoinBadge from './CoinBadge';
import CoinsPurchaseModal from './CoinsPurchaseModal';

interface TopHeaderProps {
    userData: any;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    coins?: number;
    onGetCoins?: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({
    userData,
    searchQuery,
    onSearchChange,
    coins = 0,
    onGetCoins
}) => {
    const [showCoinModal, setShowCoinModal] = useState(false);

    return (
        <header className="top-header">
            {/* Search Bar */}
            {/* Search Bar - Hidden on small mobile */}
            <div className="search-container hidden sm:flex">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Right Side: Notifications + Coins + User Profile */}
            <div className="header-right">
                {/* Notifications */}
                <NotificationBell userId={userData.userId} address={userData.address} />

                {/* Coin Balance and Get Coins Button */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-white/10 bg-white/5">
                    <CoinBadge coins={coins} size="sm" showLabel={false} />
                    <button
                        onClick={() => setShowCoinModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold transition-all duration-200 hover:scale-105"
                        title="Purchase more coins"
                    >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        <span className="hidden sm:inline">Get Coins</span>
                    </button>
                </div>
                <CoinsPurchaseModal
                    userId={userData.id || ''}
                    isOpen={showCoinModal}
                    onClose={() => setShowCoinModal(false)}
                    onSuccess={(coins) => {
                        onGetCoins?.();
                        setShowCoinModal(false);
                    }}
                />

                {/* User Profile */}
                {userData.address && (
                    <div className="user-profile">
                        <div className="user-avatar">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="16" fill="#374151" />
                                <circle cx="16" cy="12" r="5" fill="#9ca3af" />
                                <path d="M7 26c0-5 4-9 9-9s9 4 9 9" fill="#9ca3af" />
                            </svg>
                        </div>
                        <div className="user-info">
                            <span className="user-greeting">Welcome, Alex!</span>
                            <ChevronDown size={16} className="user-dropdown-icon" />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default TopHeader;
