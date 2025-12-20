'use client';

import React, { useState } from 'react';
import { X, Save, Edit, Terminal } from 'lucide-react';
import CyberCard from './CyberCard';
import CyberButton from './CyberButton';

interface EditRoomModalProps {
    roomId: string;
    userId: string;
    initialTitle: string;
    initialDescription: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';

export default function EditRoomModal({
    roomId,
    userId,
    initialTitle,
    initialDescription,
    isOpen,
    onClose,
    onSuccess
}: EditRoomModalProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) {
            setError('TITLE_REQUIRED');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/rooms/${roomId}/edit`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({ title, description })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update room');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <CyberCard
                className="w-full max-w-lg relative z-10"
                title="CONFIG_EDITOR"
                cornerStyle="tech"
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: `${NEON_CYAN}30` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border flex items-center justify-center bg-black" style={{ borderColor: NEON_CYAN }}>
                                <Edit className="w-5 h-5" style={{ color: NEON_CYAN }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider glitch-text" data-text="EDIT_CHAMBER">EDIT_CHAMBER</h2>
                                <p className="text-[10px] text-gray-500 uppercase">ID: {roomId.slice(0, 8)}...</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors border border-transparent hover:border-red-500/50"
                        >
                            <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {error && (
                            <div className="p-3 border bg-red-900/10 text-red-400 text-xs font-mono uppercase flex items-center gap-2"
                                style={{ borderColor: NEON_MAGENTA }}>
                                <Terminal className="w-4 h-4" />
                                {'>'} ERROR: {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase" style={{ color: NEON_CYAN }}>
                                {'>'} CHAMBER_TITLE
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 bg-black border text-white font-mono focus:outline-none transition-all placeholder-gray-700 uppercase"
                                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                placeholder="ENTER_TITLE..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase" style={{ color: NEON_CYAN }}>
                                {'>'} DESCRIPTION_DATA
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full p-3 bg-black border text-white font-mono focus:outline-none transition-all resize-none placeholder-gray-700"
                                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                placeholder="ENTER_DESCRIPTION..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t flex justify-end gap-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <CyberButton
                            onClick={onClose}
                            disabled={loading}
                            className="opacity-60"
                        >
                            CANCEL
                        </CyberButton>
                        <CyberButton
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2 inline-block" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                                    SAVING...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2 inline-block" />
                                    SAVE_CONFIG
                                </>
                            )}
                        </CyberButton>
                    </div>
                </div>
            </CyberCard>
        </div>
    );
}
