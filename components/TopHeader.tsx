import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import NotificationBell from './NotificationBell';

interface TopHeaderProps {
    userData: any;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ userData, searchQuery, onSearchChange }) => {
    return (
        <header className="top-header">
            {/* Search Bar */}
            <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Right Side: Notifications + User Profile */}
            <div className="header-right">
                {/* Notifications */}
                <NotificationBell />

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
