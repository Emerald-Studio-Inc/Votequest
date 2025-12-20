import { useState, useEffect } from 'react';
import { Bell, X, Check, Vote, FileText, Trophy, Trash2, Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CyberCard from './CyberCard';
import CyberButton from './CyberButton';

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

const NEON_CYAN = '#0055FF';
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

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div
            className="fixed inset-0 bg-[#09090b]/95 backdrop-blur-xl z-[200] flex items-center justify-center p-0 sm:p-4 font-mono animate-fade-in"
            onClick={onClose}
        >
            <div onClick={e => e.stopPropagation()} className="w-full max-w-md h-full sm:h-[600px] flex flex-col relative z-10">
                <CyberCard
                    className="w-full h-full flex flex-col p-0 shadow-2xl shadow-cyan-900/10 border-white/10 bg-[#121215]"
                    title="NOTIFICATIONS"
                    cornerStyle="round"
                >
                    <div className="flex flex-col h-full">
                        {/* Header Actions */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
                            <div className="flex gap-2">
                                <CyberButton
                                    onClick={() => setFilter('all')}
                                    className={`!py-1 !px-3 ${filter !== 'all' ? 'opacity-50' : ''}`}
                                >
                                    ALL
                                </CyberButton>
                                <CyberButton
                                    onClick={() => setFilter('unread')}
                                    className={`!py-1 !px-3 ${filter !== 'unread' ? 'opacity-50' : ''}`}
                                >
                                    UNREAD {unreadCount > 0 && `(${unreadCount})`}
                                </CyberButton>
                            </div>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <CyberButton
                                        onClick={markAllAsRead}
                                        className="!py-1 !px-3"
                                    >
                                        <Check className="w-3 h-3 mr-1" />
                                        ACK_ALL
                                    </CyberButton>
                                )}
                                <button onClick={onClose} className="p-1 hover:bg-white/5 rounded transition-all">
                                    <X className="w-4 h-4 text-gray-500 hover:text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40">
                            {loading ? (
                                <div className="h-full flex items-center justify-center py-20">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                                    <Bell className="w-12 h-12 mb-4" />
                                    <p className="text-sm uppercase tracking-widest">No signals detected</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {filteredNotifications.map((n) => {
                                        const Icon = getIcon(n.type);
                                        return (
                                            <div
                                                key={n.id}
                                                className={`p-4 group relative transition-colors ${n.read ? 'opacity-60' : 'bg-blue-500/5'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className={`mt-1 p-2 border ${n.read ? 'border-white/10 text-gray-500' : 'border-blue-500/30 text-blue-400'}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className={`font-bold text-xs uppercase tracking-wider truncate ${n.read ? 'text-gray-400' : 'text-white'}`}>
                                                                {n.title}
                                                            </h3>
                                                            <span className="text-[10px] text-gray-600 whitespace-nowrap ml-2">
                                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-mono leading-relaxed line-clamp-2 mb-2">
                                                            {n.message}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            {!n.read && (
                                                                <button
                                                                    onClick={() => markAsRead(n.id)}
                                                                    className="text-[10px] font-bold text-blue-400 hover:underline uppercase"
                                                                >
                                                                    {'>'} MARK_READ
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(n.id)}
                                                                className="text-[10px] font-bold text-gray-600 hover:text-red-400 uppercase"
                                                            >
                                                                {'>'} DELETE
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!n.read && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(0,85,255,0.5)]" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </CyberCard>
            </div>
        </div>
    );
}
