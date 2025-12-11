import { useState, useEffect } from 'react';
import { Bell, X, Check, Vote, FileText, Trophy, Trash2, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Notification {
    id: string;
    user_id: string;
    type: 'vote' | 'proposal' | 'achievement' | 'system' | 'coins_purchased';
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    metadata?: any;
}

interface NotificationCenterProps {
    userId: string;
    onClose: () => void;
}

export default function NotificationCenter({ userId, onClose }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        loadNotifications();
        subscribeToNotifications();
    }, [userId]);

    const loadNotifications = async () => {
        try {
            const response = await fetch(`/api/notifications?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data || []);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToNotifications = () => {
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: notificationId })
            });

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = async (notificationId: string) => {
        await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'vote': return Vote;
            case 'proposal': return FileText;
            case 'achievement': return Trophy;
            case 'coins_purchased': return Activity; // Imported from lucide-react
            default: return Bell;
        }
    };

    const filtered = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center px-6">
            <div className="card-elevated max-w-2xl w-full max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center relative">
                            <Bell className="w-6 h-6 text-white" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Notifications</h2>
                            <p className="text-sm text-mono-60">{unreadCount} unread</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="btn btn-sm btn-secondary flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 p-4 border-b border-white/10">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === 'all'
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-mono-70 hover:bg-white/10'
                            }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === 'unread'
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-mono-70 hover:bg-white/10'
                            }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="loading-spinner w-12 h-12 mx-auto" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <Bell className="w-16 h-16 text-mono-40 mx-auto mb-4" />
                            <p className="text-mono-60">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((notification) => {
                                const Icon = getIcon(notification.type);

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 rounded-xl border transition-all group ${notification.read
                                            ? 'bg-white/5 border-white/5'
                                            : 'bg-blue-500/10 border-blue-500/20'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.read ? 'bg-white/5' : 'bg-blue-500/20'
                                                }`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white mb-1">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-mono-60 mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-mono-50">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
