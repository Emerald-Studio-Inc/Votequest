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
        const interval = setInterval(fetchNotifications, 30000);
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
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative glass-medium rounded-lg p-2 transition-fast hover:glass-heavy"
            >
                <Bell className="w-5 h-5" strokeWidth={2} />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-semibold">{unreadCount}</span>
                    </div>
                )}
            </button>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    ></div>

                    <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] glass-heavy rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-scale-in">
                        <div className="p-4 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-gray-500 hover:text-white transition-fast"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-gray-500">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                            className={`
                                                p-4 cursor-pointer transition-fast hover:bg-white/5
                                                ${!notification.read ? 'bg-white/5' : ''}
                                            `}
                                        >
                                            <div className="flex items-start gap-3">
                                                {!notification.read && (
                                                    <div className="w-2 h-2 rounded-full bg-white mt-1.5"></div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium mb-1">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
