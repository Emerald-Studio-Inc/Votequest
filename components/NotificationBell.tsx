'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    proposal_id?: string;
    metadata?: any;
}

interface NotificationBellProps {
    address?: string | null;
    userId?: string | null;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ address, userId }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const NEON_CYAN = '#00F0FF';
    const NEON_MAGENTA = '#FF003C';

    useEffect(() => {
        if (!address && !userId) return;

        const fetchNotifications = async () => {
            try {
                const query = userId ? `userId=${userId}` : `address=${address}`;
                const response = await fetch(`/api/notifications?${query}`);
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                    setUnreadCount(data.filter((n: Notification) => !n.read).length);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        // fetchNotifications(); // Removed duplicate call
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [address, userId]);

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: notificationId })
            });
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const query = userId ? `userId=${userId}` : `address=${address}`;
            await fetch(`/api/notifications/mark-all-read?${query}`, { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    if (!address && !userId) return null;

    return (
        <div className="relative font-mono">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 transition-all hover:scale-110 group"
            >
                <div className="absolute inset-0 border border-transparent group-hover:border-cyan-500/50 rounded-sm transition-colors" />
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" strokeWidth={2} />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-black border border-red-500 rounded-none flex items-center justify-center shadow-[0_0_5px_#FF003C]">
                        <span className="text-[#FF003C] text-[10px] font-bold animate-pulse">{unreadCount}</span>
                    </div>
                )}
            </button>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    ></div>

                    {/* Fixed positioning to escape overflow-hidden/scroll containers in header */}
                    <div className="fixed top-20 right-4 w-80 max-w-[calc(100vw-2rem)] bg-black/90 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.1)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Scanline overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />

                        <div className="p-4 border-b border-cyan-500/20 relative">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-xs glitch-text" data-text="INCOMING_DATA">INCOMING_DATA</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] text-gray-500 hover:text-cyan-400 transition-colors uppercase hover:underline"
                                    >
                                        [ MARK_ALL_READ ]
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-xs text-gray-600 uppercase tracking-widest">{'>'}{'>'} NO_NEW_SIGNALS</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                            className={`
                                                p-4 cursor-pointer transition-all hover:bg-cyan-500/5 relative group
                                                ${!notification.read ? 'bg-cyan-900/10' : ''}
                                            `}
                                        >
                                            {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-500 shadow-[0_0_5px_#00F0FF]" />}

                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs mb-1 uppercase tracking-wide group-hover:text-cyan-300 transition-colors ${!notification.read ? 'text-white font-bold' : 'text-gray-400'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-2 bg-black/50 border-t border-white/5 text-[9px] text-gray-700 text-center uppercase tracking-widest">
                            // END_TRANSMISSION
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
