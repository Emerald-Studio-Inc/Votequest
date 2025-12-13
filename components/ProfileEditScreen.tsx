import { useState, useEffect } from 'react';
import { User, Camera, Save, X, MapPin, Tag, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/supabase-auth';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface ProfileEditScreenProps {
    userData: any;
    onBack: () => void;
    onSave: (updated: any) => void;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

export default function ProfileEditScreen({ userData, onBack, onSave }: ProfileEditScreenProps) {
    const [formData, setFormData] = useState({
        username: userData.username || '',
        fullName: userData.full_name || '',
        bio: userData.bio || '',
        location: userData.location || '',
        interests: userData.voting_interests || [],
        avatar: userData.avatar_url || ''
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const interestOptions = [
        'Climate & Environment',
        'Technology & Innovation',
        'Healthcare',
        'Education',
        'Economy & Finance',
        'Social Justice',
        'Infrastructure',
        'Arts & Culture',
        'Security & Defense',
        'International Relations'
    ];

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const avatarUrl = await uploadAvatar(userData.userId, file);
            if (avatarUrl) {
                setFormData(prev => ({ ...prev, avatar: avatarUrl }));
            }
        } catch (error) {
            console.error('Avatar upload failed:', error);
            alert('PROTOCOL_ERROR: UPLOAD_FAILED');
        } finally {
            setUploading(false);
        }
    };

    const toggleInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter((i: string) => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    username: formData.username,
                    full_name: formData.fullName,
                    bio: formData.bio,
                    location: formData.location,
                    voting_interests: formData.interests,
                    avatar_url: formData.avatar
                })
                .eq('id', userData.userId);

            if (error) throw error;

            onSave(formData);
            onBack();
        } catch (error) {
            console.error('Save failed:', error);
            alert('PROTOCOL_ERROR: SAVE_FAILED');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pb-20 font-mono text-gray-300 relative overflow-hidden custom-scrollbar">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b" style={{ borderColor: `${NEON_CYAN}30` }}>
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="w-10 h-10 border flex items-center justify-center hover:bg-white/5 transition-colors group"
                                style={{ borderColor: NEON_CYAN }}
                            >
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" style={{ color: NEON_CYAN }} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white uppercase tracking-wider glitch-text" data-text="EDIT_PROFILE">EDIT_PROFILE</h1>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{'>'} UPDATE_USER_PARAMETERS</p>
                            </div>
                        </div>

                        <ArcadeButton
                            onClick={handleSave}
                            disabled={saving}
                            variant="cyan"
                            className="flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'WRITING...' : 'SAVE_CHANGES'}
                        </ArcadeButton>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 relative z-10">
                {/* Avatar */}
                <CyberCard title="IDENTITY_MATRIX" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-8">
                        <div className="relative group">
                            <div className="w-24 h-24 border-2 flex items-center justify-center overflow-hidden bg-black" style={{ borderColor: NEON_CYAN }}>
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 opacity-50" style={{ color: NEON_CYAN }} />
                                )}
                            </div>

                            {/* Scanning overlay */}
                            <div className="absolute inset-0 bg-scanlines opacity-30 pointer-events-none" />

                            <label className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-6 h-6" style={{ color: NEON_CYAN }} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase mb-1 text-white">AVATAR_UPLOAD</p>
                            <p className="text-[10px] text-gray-500 uppercase font-mono mb-2">
                                {'>'} FORMAT: JPG/PNG/GIF<br />
                                {'>'} MAXIMUM_CAPACITY: 2MB
                            </p>
                            {uploading && <p className="text-xs animate-pulse font-bold uppercase" style={{ color: NEON_CYAN }}>{'>'} UPLOADING_DATA_PACKET...</p>}
                        </div>
                    </div>
                </CyberCard>

                {/* Basic Info */}
                <CyberCard title="CORE_DATA" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase" style={{ color: NEON_CYAN }}>
                                {'>'} USERNAME_ID *
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                className="w-full bg-black border p-3 text-white font-mono focus:outline-none transition-all uppercase text-sm"
                                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                placeholder="ENTER_ID..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase" style={{ color: NEON_CYAN }}>
                                {'>'} FULL_DESIGNATION
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full bg-black border p-3 text-white font-mono focus:outline-none transition-all uppercase text-sm"
                                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                placeholder="ENTER_NAME..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase" style={{ color: NEON_CYAN }}>
                                {'>'} GEOLOCATION_DATA
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full bg-black border p-3 pl-10 text-white font-mono focus:outline-none transition-all uppercase text-sm"
                                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                    onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                    placeholder="CITY_COUNTRY..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase" style={{ color: NEON_CYAN }}>
                                {'>'} BIO_SIGNATURE
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                className="w-full bg-black border p-3 text-white font-mono focus:outline-none transition-all resize-none text-sm"
                                rows={4}
                                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                placeholder="ENTER_DESCRIPTION..."
                                maxLength={280}
                            />
                            <p className="text-[10px] text-gray-500 uppercase mt-1 text-right">
                                {formData.bio.length} / 280 CAPACITY
                            </p>
                        </div>
                    </div>
                </CyberCard>

                {/* Interests */}
                <CyberCard title="INTEREST_VECTORS" className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <p className="text-xs text-gray-500 mb-4 uppercase">
                        {'>'} SELECT_VECTORS_FOR_OPTIMIZATION:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {interestOptions.map((interest) => {
                            const isSelected = formData.interests.includes(interest);
                            return (
                                <button
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className="px-3 py-1.5 border text-xs font-bold transition-all uppercase flex items-center gap-2 group relative overflow-hidden"
                                    style={{
                                        borderColor: isSelected ? NEON_LIME : 'rgba(255,255,255,0.1)',
                                        color: isSelected ? 'black' : 'gray',
                                        backgroundColor: isSelected ? NEON_LIME : 'transparent'
                                    }}
                                >
                                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                                    <span className="relative z-10">{interest}</span>
                                    {!isSelected && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                </button>
                            );
                        })}
                    </div>
                </CyberCard>
            </div>
        </div>
    );
}
