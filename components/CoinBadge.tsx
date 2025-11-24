import React, { useEffect, useState } from 'react';

interface CoinBadgeProps {
    coins: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const CoinBadge: React.FC<CoinBadgeProps> = ({ coins, size = 'md', showLabel = false }) => {
    const [prevCoins, setPrevCoins] = useState(coins);
    const [celebrating, setCelebrating] = useState(false);

    useEffect(() => {
        if (coins > prevCoins) {
            setCelebrating(true);
            setTimeout(() => setCelebrating(false), 1000);
        }
        setPrevCoins(coins);
    }, [coins]);

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    return (
        <div
            className={`
                glass-medium rounded-lg flex items-center gap-2 font-medium
                transition-all duration-300
                ${sizeClasses[size]}
                ${celebrating ? 'scale-110 border-white/20' : 'border-white/5'}
            `}
            title={`${coins} VoteQuest Coins`}
        >
            <div className={`
                w-2 h-2 rounded-full bg-white
                ${celebrating ? 'animate-pulse' : ''}
            `}></div>
            <span className="tracking-tight">{coins.toLocaleString()}</span>
            {showLabel && <span className="text-gray-500 text-xs">VQC</span>}
        </div>
    );
};

export default CoinBadge;
