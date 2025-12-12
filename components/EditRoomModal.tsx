'use client';

import React, { useState } from 'react';
import { X, Save, Edit } from 'lucide-react';

interface EditRoomModalProps {
    roomId: string;
    userId: string;
    initialTitle: string;
    initialDescription: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

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
            setError('Title is required');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-black/90 border border-white/10 rounded-3xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Edit className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">Edit Room</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-mono-60 mb-2">Room Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 hover:border-white/20 transition-all font-bold text-lg"
                            placeholder="Enter room title..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-mono-60 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 hover:border-white/20 transition-all resize-none"
                            placeholder="Describe what this vote is about..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {loading ? <div className="loading-spinner w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
