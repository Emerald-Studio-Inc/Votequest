import { useState, useEffect } from 'react';
import { User, Camera, Save, X, MapPin, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/supabase-auth';

interface ProfileEditScreenProps {
    userData: any;
    onBack: () => void;
    onSave: (updated: any) => void;
}

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
            alert('Failed to upload avatar. Please try again.');
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
            alert('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-white/10">
                <div className="max-w-2xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                                <p className="text-sm text-mono-60">Update your information</p>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* Avatar */}
                <div className="card p-8 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Profile Picture</h2>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-mono-70" />
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                                <Camera className="w-6 h-6 text-white" />
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
                            <p className="text-sm text-white font-medium mb-1">Change Photo</p>
                            <p className="text-xs text-mono-60">JPG, PNG or GIF. Max 2MB.</p>
                            {uploading && <p className="text-xs text-blue-400 mt-2">Uploading...</p>}
                        </div>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="card p-8 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-mono-70 mb-2">
                                Username *
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/30 outline-none"
                                placeholder="Your username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-mono-70 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/30 outline-none"
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-mono-70 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/30 outline-none"
                                placeholder="City, Country"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-mono-70 mb-2">
                                Bio
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/30 outline-none resize-none"
                                rows={4}
                                placeholder="Tell us about yourself..."
                                maxLength={280}
                            />
                            <p className="text-xs text-mono-60 mt-1">
                                {formData.bio.length}/280 characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* Interests */}
                <div className="card p-8">
                    <h2 className="text-lg font-semibold text-white mb-2">
                        <Tag className="w-5 h-5 inline mr-2" />
                        Voting Interests
                    </h2>
                    <p className="text-sm text-mono-60 mb-4">
                        Select topics you're interested in (helps personalize your experience)
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {interestOptions.map((interest) => (
                            <button
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.interests.includes(interest)
                                        ? 'bg-white text-black'
                                        : 'bg-white/5 text-mono-70 hover:bg-white/10'
                                    }`}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
