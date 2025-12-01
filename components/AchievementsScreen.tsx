import { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, Users, TrendingUp, Award, Lock, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AchievementsScreenProps {
    userData: any;
    onBack: () => void;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement: number;
    reward_coins: number;
    category: string;
    unlocked?: boolean;
    progress?: number;
    unlocked_at?: string;
}

export default function AchievementsScreen({ userData, onBack }: AchievementsScreenProps) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userAchievements, setUserAchievements] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAchievements();
    }, [userData.userId]);

    const loadAchievements = async () => {
        setLoading(true);

        // Fetch all achievements
        const { data: allAchievements } = await supabase
            .from('achievements')
            .select('*')
            .order('requirement', { ascending: true });

        // Fetch user's unlocked achievements
        const { data: unlocked } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userData.userId);

        // Merge data
        const merged = (allAchievements || []).map(achievement => {
            const userAch = unlocked?.find(u => u.achievement_id === achievement.id);
            const progress = calculateProgress(achievement, userData);

            return {
                ...achievement,
                unlocked: !!userAch,
                progress,
                unlocked_at: userAch?.unlocked_at
            };
        });

        setAchievements(merged);
        setUserAchievements(unlocked || []);
        setLoading(false);
    };

    const calculateProgress = (achievement: any, userData: any): number => {
        // Calculate progress based on achievement type
        const { name, requirement } = achievement;

        if (name.includes('Vote')) {
            return Math.min(100, (userData.votesCount / requirement) * 100);
        }
        if (name.includes('Proposal')) {
            return Math.min(100, (userData.proposalsCount / requirement) * 100);
        }
        if (name.includes('Coins')) {
            return Math.min(100, (userData.coins / requirement) * 100);
        }
        if (name.includes('Streak')) {
            return Math.min(100, (userData.streak / requirement) * 100);
        }

        return 0;
    };

    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            trophy: Trophy,
            star: Star,
            target: Target,
            zap: Zap,
            users: Users,
            trending: TrendingUp,
            award: Award
        };
        return icons[iconName] || Trophy;
    };

    const categories = [
        { id: 'all', label: 'All Achievements' },
        { id: 'voting', label: 'Voting' },
        { id: 'proposals', label: 'Proposals' },
        { id: 'social', label: 'Social' },
        { id: 'special', label: 'Special' }
    ];

    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : achievements.filter(a => a.category === selectedCategory);

    const stats = {
        unlocked: achievements.filter(a => a.unlocked).length,
        total: achievements.length,
        coins: userAchievements.reduce((sum, ua) => {
            const ach = achievements.find(a => a.id === ua.achievement_id);
            return sum + (ach?.reward_coins || 0);
        }, 0)
    };

    return (
        <div className="min-h-screen bg-black pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                            >
                                ←
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Achievements</h1>
                                <p className="text-sm text-mono-60">Unlock badges by participating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <p className="text-sm text-mono-60">Unlocked</p>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {stats.unlocked}<span className="text-lg text-mono-60">/{stats.total}</span>
                        </p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="w-5 h-5 text-blue-400" />
                            <p className="text-sm text-mono-60">Completion</p>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {Math.round((stats.unlocked / stats.total) * 100)}%
                        </p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Star className="w-5 h-5 text-green-400" />
                            <p className="text-sm text-mono-60">Coins Earned</p>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.coins}</p>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedCategory === cat.id
                                    ? 'bg-white text-black'
                                    : 'bg-white/5 text-mono-70 hover:bg-white/10'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Achievements Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="loading-spinner w-12 h-12 mx-auto" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAchievements.map((achievement) => {
                            const Icon = getIconComponent(achievement.icon);
                            const isUnlocked = achievement.unlocked;
                            const progress = achievement.progress || 0;

                            return (
                                <div
                                    key={achievement.id}
                                    className={`card p-6 relative overflow-hidden transition-all hover:scale-105 ${isUnlocked ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent' : ''
                                        }`}
                                >
                                    {/* Unlock animation overlay */}
                                    {isUnlocked && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                <Check className="w-5 h-5 text-yellow-400" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center ${isUnlocked
                                            ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20'
                                            : 'bg-white/5'
                                        }`}>
                                        {isUnlocked ? (
                                            <Icon className="w-8 h-8 text-yellow-400" />
                                        ) : (
                                            <Lock className="w-8 h-8 text-mono-50" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-mono-70'
                                        }`}>
                                        {achievement.name}
                                    </h3>
                                    <p className="text-sm text-mono-60 mb-4">{achievement.description}</p>

                                    {/* Progress */}
                                    {!isUnlocked && (
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs text-mono-60 mb-1">
                                                <span>Progress</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Reward */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <span className="text-sm text-mono-60">Reward</span>
                                        <span className="text-sm font-bold text-yellow-400">
                                            +{achievement.reward_coins} VQC
                                        </span>
                                    </div>

                                    {/* Unlock date */}
                                    {isUnlocked && achievement.unlocked_at && (
                                        <p className="text-xs text-mono-50 mt-2">
                                            Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
