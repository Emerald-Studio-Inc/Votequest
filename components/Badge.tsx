import React from 'react';
import { Star, Flame, Vote, PenTool, Trophy, Lock } from 'lucide-react';
import { Achievement } from '@/lib/supabase';

interface BadgeProps {
    achievement: Achievement;
    earned: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const Badge: React.FC<BadgeProps> = ({ achievement, earned, size = 'md' }) => {
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Star': return Star;
            case 'Flame': return Flame;
            case 'Vote': return Vote;
            case 'PenTool': return PenTool;
            default: return Trophy;
        }
    };

    const Icon = getIcon(achievement.icon);

    const sizeClasses = {
        sm: 'w-8 h-8 p-1.5',
        md: 'w-12 h-12 p-2.5',
        lg: 'w-16 h-16 p-3'
    };

    const iconSizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-5 h-5',
        lg: 'w-7 h-7'
    };

    return (
        <div className="group relative flex flex-col items-center">
            <div
                className={`
                    ${sizeClasses[size]} rounded-xl flex items-center justify-center transition-all duration-300
                    ${earned
                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                        : 'bg-white/5 border border-white/5 text-gray-600'
                    }
                `}
            >
                {earned ? (
                    <Icon className={iconSizes[size]} strokeWidth={2} />
                ) : (
                    <Lock className={iconSizes[size]} strokeWidth={1.5} />
                )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 w-48 text-center translate-y-2 group-hover:translate-y-0">
                <div className="glass-heavy rounded-lg p-3 shadow-2xl border border-white/10">
                    <div className={`text-sm font-medium mb-1 ${earned ? 'text-white' : 'text-gray-500'}`}>
                        {achievement.name}
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed mb-2">
                        {achievement.description}
                    </div>
                    <div className="text-[10px] font-medium text-white/80 bg-white/10 inline-block px-2 py-0.5 rounded">
                        +{achievement.xp_reward} XP
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Badge;
