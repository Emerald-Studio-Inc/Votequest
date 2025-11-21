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
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className="group relative flex flex-col items-center">
            <div
                className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300
          ${earned
                        ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-500/50 text-yellow-500 shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)]'
                        : 'bg-zinc-900/50 border border-zinc-800 text-zinc-700 grayscale'
                    }
        `}
            >
                {earned ? <Icon className={iconSizes[size]} strokeWidth={1.5} /> : <Lock className={iconSizes[size]} strokeWidth={1.5} />}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-48 text-center">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl">
                    <div className={`text-sm font-medium mb-1 ${earned ? 'text-white' : 'text-zinc-500'}`}>
                        {achievement.name}
                    </div>
                    <div className="text-xs text-zinc-500 leading-relaxed">
                        {achievement.description}
                    </div>
                    <div className="mt-2 text-xs font-mono text-yellow-500/80">
                        +{achievement.xp_reward} XP
                    </div>
                </div>
                <div className="w-2 h-2 bg-zinc-900 border-r border-b border-zinc-800 rotate-45 mx-auto -mt-1"></div>
            </div>
        </div>
    );
};

export default Badge;
