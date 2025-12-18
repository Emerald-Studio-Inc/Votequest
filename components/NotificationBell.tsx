'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

interface NotificationBellProps {
    address?: string | null;
    userId?: string | null;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ address, userId }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showCenter, setShowCenter] = useState(false);

    useEffect(() => {
        if (!address && !userId) return;

        const fetchUnreadCount = async () => {
            try {
                const query = userId ? `userId=${userId}` : `address=${address}`;
                const response = await fetch(`/api/notifications?${query}`);
                if (response.ok) {
                    const data = await response.json();
                    setUnreadCount(data.filter((n: any) => !n.read).length);
                }
            } catch (error) {
                console.error('Error fetching notification count:', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [address, userId]);

    if (!address && !userId) return null;

    return (
        <>
            <div className="relative font-mono">
                <button
                    onClick={() => setShowCenter(true)}
                    className="relative p-2 transition-all hover:scale-110 group"
                >
                    <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/50 rounded-sm transition-colors" />
                    <Bell className="w-5 h-5 text-gray-200 group-hover:text-blue-400 transition-colors" strokeWidth={2} />
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-black border border-red-500 rounded-none flex items-center justify-center shadow-[0_0_5px_#FF003C]">
                            <span className="text-[#FF003C] text-[10px] font-bold animate-pulse">{unreadCount}</span>
                        </div>
                    )}
                </button>
            </div>

            {showCenter && userId && (
                <NotificationCenter
                    userId={userId}
                    onClose={() => {
                        setShowCenter(false);
                        setUnreadCount(0); // Optimistically clear count on close/view
                    }}
                />
            )}
        </>
    );
};

export default NotificationBell;
