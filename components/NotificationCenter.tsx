import { useState, useEffect } from 'react';
import { Bell, X, Check, Vote, FileText, Trophy, Trash2, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

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

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';

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
            case 'coins_purchased': return Activity;
            default: return Bell;
        }
    };

    const filtered = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 font-mono animate-fade-in">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <CyberCard
                className="w-full max-w-2xl h-[85vh] flex flex-col p-0 relative z-10"
                title="COMM_LINK"
                cornerStyle="tech"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: `${NEON_CYAN}30` }}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border flex items-center justify-center relative bg-black" style={{ borderColor: NEON_CYAN }}>
                            <Bell className="w-6 h-6 animate-pulse" style={{ color: NEON_CYAN }} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-black border text-[10px] font-bold"
                                    style={{ borderColor: NEON_MAGENTA, color: NEON_MAGENTA }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider glitch-text transition-all" data-text="TRANSMISSIONS">TRANSMISSIONS</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                                {unreadCount} NEW_MESSAGES
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <ArcadeButton
                                onClick={markAllAsRead}
                                variant="cyan"
                                className="text-[10px] px-3 py-1 h-auto"
                            >
                                <div className="flex items-center gap-2">
                                    <Check className="w-3 h-3" />
                                    ACK_ALL
                                </div>
                            </ArcadeButton>
                        )}
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors border border-transparent hover:border-red-500/50 group"
                        >
                            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 p-4 border-b bg-black/20" style={{ borderColor: `${NEON_CYAN}30` }}>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border transition-all ${filter === 'all'
                            ? 'bg-cyan-900/20 text-cyan-400'
                            : 'bg-transparent text-gray-500 border-transparent hover:border-white/10 hover:text-white'
                            }`}
                        style={{ borderColor: filter === 'all' ? NEON_CYAN : undefined }}
                    >
                        ALL_LOGS ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border transition-all ${filter === 'unread'
                            ? 'bg-red-900/20 text-red-500 border-red-500'
                            : 'bg-transparent text-gray-500 border-transparent hover:border-white/10 hover:text-white'
                            }`}
                    >
                        UNREAD ({unreadCount})
                    </button>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto p-4 bg-black/40 relative">
                    {/* Scanlines */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none opacity-50" />

                    {loading ? (
                        <div className="text-center py-20 flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: NEON_CYAN, borderTopColor: 'transparent' }} />
                            <span className="text-xs text-cyan-500 animate-pulse">DECRYPTING_SIGNALS...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 opacity-50">
                            <Bell className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <p className="text-xs text-gray-500 uppercase tracking-widest">{'>'}{'>'} NO_ACTIVE_SIGNALS</p>
                        </div>
                    ) : (
                        <div className="space-y-3 relative z-10">
                            {filtered.map((notification) => {
                                const Icon = getIcon(notification.type);

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border transition-all group relative overflow-hidden ${notification.read
                                            ? 'bg-black/40 border-white/5 opacity-70 hover:opacity-100'
                                            : 'bg-cyan-900/10'
                                            }`}
                                        style={{ borderColor: notification.read ? undefined : `${NEON_CYAN}50` }}
                                    >
                                        {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_#00F0FF]" />}

                                        <div className="flex gap-4 relative z-10">
                                            <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    borderColor: notification.read ? 'rgba(255,255,255,0.1)' : NEON_CYAN,
                                                    color: notification.read ? 'gray' : NEON_CYAN
                                                }}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className={`text-xs font-bold uppercase mb-1 tracking-wide ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <span className="text-[9px] text-gray-600 font-mono">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 font-mono leading-relaxed group-hover:text-gray-300 transition-colors">
                                                    {notification.message}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="w-8 h-8 border border-white/10 hover:border-cyan-500 hover:text-cyan-500 flex items-center justify-center transition-colors bg-black"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="w-8 h-8 border border-white/10 hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-colors bg-black"
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
            </CyberCard>
        </div>
    );
}
