import { useState, useEffect } from 'react';
import { Bell, X, Check, Vote, FileText, Trophy, Trash2, Activity, Loader2 } from 'lucide-react';
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

    // Advanced Smart Grouping Logic
    const groupNotifications = (notifs: Notification[]) => {
        const groups: { [key: string]: Notification[] } = {};
        const singles: Notification[] = [];

        notifs.forEach(n => {
            // Group 1: Votes on specific target
            if (n.type === 'vote' && n.metadata?.targetId) {
                const key = `vote-${n.metadata.targetId}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(n);
                return;
            }

            // Group 2: System/Proposal messages with same Title (e.g. "PROPOSAL ENDED")
            if (['system', 'proposal'].includes(n.type)) {
                const key = `${n.type}-${n.title}`;
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(n);
                return;
            }

            // Default: Single
            singles.push(n);
        });

        // Filter: Only return groups if they have > 1 item, otherwise move back to singles? 
        // For now, simplify: if it's in a group map but only has 1 item, render it as single.
        const finalGroups: { [key: string]: Notification[] } = {};
        const finalSingles = [...singles];

        Object.entries(groups).forEach(([key, items]) => {
            if (items.length > 1) {
                finalGroups[key] = items;
            } else {
                finalSingles.push(items[0]);
            }
        });

        // Sort singles by date desc
        finalSingles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return { groups: finalGroups, singles: finalSingles };
    };

    const { groups, singles } = groupNotifications(filter === 'unread' ? notifications.filter(n => !n.read) : notifications);
    const hasNotifications = singles.length > 0 || Object.keys(groups).length > 0;
    const unreadCount = notifications.filter(n => !n.read).length;

    // Strict Limit to prevent rendering lag
    const displayedSingles = singles.slice(0, 30);

    const handleGroupRead = async (groupNotifications: Notification[]) => {
        // Optimistically update UI
        const ids = groupNotifications.map(n => n.id);
        setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));

        // Batch requests
        await Promise.all(groupNotifications.map(n =>
            fetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: n.id })
            })
        ));
    };

    return (
        <div
            className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 font-mono animate-fade-in"
            onClick={onClose} // Click outside to close
        >
            <div onClick={e => e.stopPropagation()} className="w-full max-w-md h-[450px] flex flex-col relative z-10">
                <CyberCard
                    className="w-full h-full flex flex-col p-0 shadow-2xl shadow-cyan-900/10 border-white/10 bg-[#121215]"
                    title="NOTIFICATIONS"
                    cornerStyle="round"
                >
                    {/* Header - Minimalist */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/2">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Bell className="w-3.5 h-3.5 text-gray-400" />
                                {unreadCount > 0 && (
                                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full box-content border border-black" />
                                )}
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                {unreadCount} New
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-[9px] hover:text-blue-400 text-gray-600 transition-colors uppercase tracking-wider">
                                    Mark all read
                                </button>
                            )}
                            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded transition-all">
                                <X className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Content - Clean List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b]/40">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                        ) : !hasNotifications ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-2">
                                <Bell className="w-6 h-6 opacity-20" />
                                <p className="text-[10px] uppercase tracking-wider font-semibold">All Caught Up</p>
                            </div>
                        ) : (
                            <div className="py-1">
                                {singles.map((n) => {
                                    const Icon = getIcon(n.type);
                                    return (
                                        <div
                                            key={n.id}
                                            className={`
                                                group relative flex gap-2.5 px-3 py-2.5 transition-all cursor-default
                                                ${n.read ? 'opacity-50 hover:opacity-80' : 'bg-white/[0.02] hover:bg-white/[0.04]'}
                                                border-b border-white/5 last:border-0
                                            `}
                                        >
                                            <div className={`mt-0.5 ${n.read ? 'text-gray-600' : 'text-blue-500'}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className={`text-[11px] font-medium leading-tight ${n.read ? 'text-gray-500' : 'text-gray-200'}`}>
                                                        {n.title}
                                                    </h3>
                                                    <span className="text-[9px] text-gray-700 ml-2 whitespace-nowrap">
                                                        {new Date(n.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed truncate">
                                                    {n.message}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!n.read && (
                                                    <button onClick={() => markAsRead(n.id)} title="Mark Read" className="p-0.5 hover:text-blue-400 text-gray-600">
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <button onClick={() => deleteNotification(n.id)} title="Delete" className="p-0.5 hover:text-red-400 text-gray-600">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {!n.read && (
                                                <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-blue-500/50 rounded-r-full" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </CyberCard>
            </div>
        </div>
    );
}
