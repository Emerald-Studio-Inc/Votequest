'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Link2, FileText, X, Radio, Upload, ExternalLink } from 'lucide-react';
import CyberButton from './CyberButton';
import CyberCard from './CyberCard';

interface DebateConsoleProps {
    debateId: string;
    userId: string;
    isParticipant: boolean;
    onClose: () => void;
}

interface MediaItem {
    id: string;
    media_type: 'IMAGE' | 'LINK' | 'TEXT_SNIPPET' | 'FILE';
    content: string;
    title?: string;
    is_broadcast: boolean;
    senderName: string;
    created_at: string;
}

export default function DebateConsole({ debateId, userId, isParticipant, onClose }: DebateConsoleProps) {
    const [personalMedia, setPersonalMedia] = useState<MediaItem[]>([]);
    const [broadcastMedia, setBroadcastMedia] = useState<MediaItem[]>([]);
    const [newContent, setNewContent] = useState('');
    const [mediaType, setMediaType] = useState<'LINK' | 'TEXT_SNIPPET'>('TEXT_SNIPPET');
    const [isLoading, setIsLoading] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const broadcastRef = useRef<HTMLDivElement>(null);

    // Fetch media on mount and poll for updates
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                // Fetch broadcast media (visible to all)
                const broadcastRes = await fetch(`/api/debates/${debateId}/media?broadcast=true`);
                const broadcastData = await broadcastRes.json();
                if (broadcastData.media) setBroadcastMedia(broadcastData.media);

                // Fetch personal media (only if participant)
                if (isParticipant) {
                    const personalRes = await fetch(`/api/debates/${debateId}/media?userId=${userId}`);
                    const personalData = await personalRes.json();
                    if (personalData.media) {
                        setPersonalMedia(personalData.media.filter((m: MediaItem) => !m.is_broadcast));
                    }
                }
            } catch (e) {
                console.error('Failed to fetch media:', e);
            }
        };

        fetchMedia();
        const interval = setInterval(fetchMedia, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [debateId, userId, isParticipant]);

    // Auto-scroll broadcast feed
    useEffect(() => {
        if (broadcastRef.current) {
            broadcastRef.current.scrollTop = broadcastRef.current.scrollHeight;
        }
    }, [broadcastMedia]);

    const handleSubmit = async (broadcast: boolean) => {
        if (!newContent.trim()) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/debates/${debateId}/media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    mediaType,
                    content: newContent,
                    broadcast
                })
            });

            const data = await res.json();
            if (data.media) {
                if (broadcast) {
                    setBroadcastMedia([...broadcastMedia, data.media]);
                } else {
                    setPersonalMedia([...personalMedia, data.media]);
                }
                setNewContent('');
            }
        } catch (e) {
            console.error('Failed to share media:', e);
        }
        setIsLoading(false);
    };

    const promoteToBroadcast = async (mediaId: string) => {
        setIsBroadcasting(true);
        try {
            await fetch(`/api/debates/${debateId}/media`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaId, broadcast: true })
            });

            // Move from personal to broadcast
            const item = personalMedia.find(m => m.id === mediaId);
            if (item) {
                setPersonalMedia(personalMedia.filter(m => m.id !== mediaId));
                setBroadcastMedia([...broadcastMedia, { ...item, is_broadcast: true }]);
            }
        } catch (e) {
            console.error('Failed to promote media:', e);
        }
        setIsBroadcasting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-[200] flex">
            {/* Left Panel: Personal Research (Participants Only) */}
            {isParticipant && (
                <div className="w-1/3 border-r border-cyan-500/20 flex flex-col">
                    <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
                            INTEL_CACHE
                        </h2>
                        <span className="text-[10px] text-gray-500">{personalMedia.length} ITEMS</span>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-b border-white/10 space-y-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMediaType('TEXT_SNIPPET')}
                                className={`flex-1 py-2 text-xs uppercase ${mediaType === 'TEXT_SNIPPET' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' : 'bg-white/5 text-gray-500 border-white/10'} border`}
                            >
                                <FileText className="w-3 h-3 inline mr-1" /> Text
                            </button>
                            <button
                                onClick={() => setMediaType('LINK')}
                                className={`flex-1 py-2 text-xs uppercase ${mediaType === 'LINK' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' : 'bg-white/5 text-gray-500 border-white/10'} border`}
                            >
                                <Link2 className="w-3 h-3 inline mr-1" /> Link
                            </button>
                        </div>
                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder={mediaType === 'LINK' ? 'Paste URL...' : 'Enter research notes...'}
                            className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm resize-none h-20 focus:outline-none focus:border-cyan-500/50"
                        />
                        <div className="flex gap-2">
                            <CyberButton
                                onClick={() => handleSubmit(false)}
                                disabled={isLoading || !newContent.trim()}
                                className="flex-1 !py-2 text-xs"
                            >
                                SAVE_LOCAL
                            </CyberButton>
                            <CyberButton
                                onClick={() => handleSubmit(true)}
                                disabled={isLoading || !newContent.trim()}
                                className="flex-1 !py-2 text-xs !bg-magenta-500/20 hover:!bg-magenta-500"
                            >
                                <Radio className="w-3 h-3 mr-1" /> BROADCAST
                            </CyberButton>
                        </div>
                    </div>

                    {/* Personal Media List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {personalMedia.length === 0 ? (
                            <div className="text-center text-gray-600 text-xs py-8">
                                No saved research. Add notes above.
                            </div>
                        ) : (
                            personalMedia.map((item) => (
                                <div key={item.id} className="p-3 bg-white/5 border border-white/10 group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {item.media_type === 'LINK' ? (
                                                <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-sm hover:underline flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3" />
                                                    {item.content.substring(0, 40)}...
                                                </a>
                                            ) : (
                                                <p className="text-gray-300 text-sm">{item.content}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => promoteToBroadcast(item.id)}
                                            disabled={isBroadcasting}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-magenta-400 hover:bg-magenta-500/20 transition-all"
                                            title="Broadcast to Arena"
                                        >
                                            <Radio className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Right Panel: Broadcast Feed (Visible to All) */}
            <div className={`${isParticipant ? 'w-2/3' : 'w-full'} flex flex-col`}>
                <div className="p-4 border-b border-magenta-500/20 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-magenta-400 uppercase tracking-widest flex items-center gap-2">
                        <Radio className="w-4 h-4 animate-pulse" />
                        LIVE_BROADCAST
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Broadcast Stream */}
                <div ref={broadcastRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {broadcastMedia.length === 0 ? (
                        <div className="text-center text-gray-600 py-20">
                            <Radio className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-sm">No broadcasts yet.</p>
                            <p className="text-xs text-gray-700">Participants can share intel from their console.</p>
                        </div>
                    ) : (
                        broadcastMedia.map((item) => (
                            <div key={item.id} className="p-4 bg-magenta-500/5 border border-magenta-500/20 animate-slide-up">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-magenta-400 font-mono text-sm">{item.senderName}</span>
                                    <span className="text-gray-600 text-xs">
                                        {new Date(item.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                {item.media_type === 'LINK' ? (
                                    <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        {item.content}
                                    </a>
                                ) : item.media_type === 'IMAGE' ? (
                                    <img src={item.content} alt="Shared" className="max-w-full max-h-64 rounded" />
                                ) : (
                                    <p className="text-white">{item.content}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
