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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 font-mono animate-fade-in"
            onClick={onClose} // Click outside to close
        >
            {/* Cyber Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl h-[85vh] flex flex-col relative z-10">
                <CyberCard
                    className="w-full h-full flex flex-col p-0 shadow-2xl shadow-cyan-900/20"
                    title="INTELLIGENCE_FEED"
                    cornerStyle="tech"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-cyan-900/30 bg-black/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border border-cyan-500/30 flex items-center justify-center bg-cyan-950/20 relative">
                                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 text-[8px] items-center justify-center text-black font-bold">
                                            {unreadCount}
                                        </span>
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-widest text-shadow-neon">SYSTEM_LOGS</h2>
                                <p className="text-[10px] text-cyan-500/70 uppercase tracking-[0.2em]">
                                    AWAITING_INPUT
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <ArcadeButton onClick={markAllAsRead} variant="cyan" className="text-[10px] h-7 px-3">
                                    ACKNOWLEDGE_ALL
                                </ArcadeButton>
                            )}
                            <button onClick={onClose} className="p-2 hover:bg-red-950/30 border border-transparent hover:border-red-500/50 rounded transition-all group">
                                <X className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-1 p-1 bg-black/40 border-b border-white/5">
                        {['all', 'unread'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${filter === f
                                    ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10'
                                    : 'border-transparent text-gray-600 hover:text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                {f === 'all' ? `ALL_DIVERGENCE (${notifications.length})` : `CRITICAL (${unreadCount})`}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-black/60 scrollbar-thin scrollbar-thumb-cyan-900/50">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-cyan-500/50">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-xs tracking-widest animate-pulse">SYNCING...</span>
                            </div>
                        ) : !hasNotifications ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                                <Bell className="w-10 h-10 opacity-20" />
                                <p className="text-xs uppercase tracking-widest">NO_NEW_INTELLIGENCE</p>
                            </div>
                        ) : (
                            <>
                                {/* Grouped Notifications */}
                                {/* Grouped Notifications */}
                                {Object.entries(groups).map(([key, groupInfos]) => {
                                    const representative = groupInfos[0];
                                    const GroupIcon = getIcon(representative.type);
                                    const isVote = representative.type === 'vote';

                                    return (
                                        <div key={key} className="p-3 border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/30 transition-all group relative overflow-hidden rounded-sm shadow-sm">
                                            {/* Group Count Badge */}
                                            <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 pointer-events-none">
                                                x{groupInfos.length}
                                            </div>

                                            <div className="flex gap-3 items-center">
                                                <div className="w-8 h-8 border border-cyan-500/50 flex items-center justify-center text-cyan-300 bg-black/60">
                                                    <GroupIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <h3 className="text-xs font-bold text-white uppercase tracking-wide truncate">
                                                        {isVote
                                                            ? `${groupInfos.length} VOTES RECEIVED`
                                                            : `${representative.title} (x${groupInfos.length})`
                                                        }
                                                    </h3>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                                                        {isVote
                                                            ? <span>On proposal: <span className="text-cyan-300">"{representative.message}"</span></span>
                                                            : <span className="text-gray-500 italic">Expand to see details...</span>
                                                        }
                                                    </p>

                                                    {/* Preview of items if not votes */}
                                                    {!isVote && (
                                                        <div className="mt-1 flex gap-1 overflow-hidden h-1">
                                                            {groupInfos.slice(0, 10).map((gi, idx) => (
                                                                <div key={idx} className={`w-1 h-1 rounded-full ${gi.read ? 'bg-gray-600' : 'bg-cyan-500'}`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2 z-10">
                                                    <button onClick={(e) => { e.stopPropagation(); handleGroupRead(groupInfos); }}
                                                        className="p-1.5 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/50 transition-all rounded"
                                                        title="Mark Group Read"
                                                    >
                                                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Single Notifications - Limited to 50 */}
                                {displayedSingles.map((n) => {
                                    const Icon = getIcon(n.type);
                                    return (
                                        <div key={n.id} className={`p-3 border transition-all flex gap-3 group relative overflow-hidden rounded-sm ${n.read ? 'border-white/5 bg-transparent opacity-60' : 'border-cyan-500/30 bg-cyan-950/10'}`}>
                                            <div className={`w-8 h-8 border flex items-center justify-center flex-shrink-0 bg-black ${n.read ? 'border-white/10 text-gray-500' : 'border-cyan-500/50 text-cyan-400'}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className={`text-[11px] font-bold uppercase tracking-wide truncate ${n.read ? 'text-gray-500' : 'text-white'}`}>{n.title}</h3>
                                                    <span className="text-[9px] text-gray-600 font-mono whitespace-nowrap ml-2">{new Date(n.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed truncate">{n.message}</p>
                                            </div>
                                            {!n.read && (
                                                <button onClick={() => markAsRead(n.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/5 transition-all">
                                                    <Check className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                                                </button>
                                            )}
                                            <button onClick={() => deleteNotification(n.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-950/30 transition-all">
                                                <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-500" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </div>
                </CyberCard>
            </div>
        </div>
    );
}
