import React, { useEffect, useState } from 'react';

interface CoinBadgeProps {
    coins: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    onClick?: () => void;
}

const CoinBadge: React.FC<CoinBadgeProps> = ({ coins, size = 'md', showLabel = false, onClick }) => {
    const safeCoins = coins ?? 0;
    const [prevCoins, setPrevCoins] = useState(safeCoins);
    const [celebrating, setCelebrating] = useState(false);

    useEffect(() => {
        if (safeCoins > prevCoins) {
            setCelebrating(true);
            setTimeout(() => setCelebrating(false), 1000);
        }
        setPrevCoins(safeCoins);
    }, [safeCoins]);

    const NEON_CYAN = '#00F0FF';

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    return (
        <div
            className={`
                flex items-center gap-2 font-mono uppercase tracking-wider
                transition-all duration-300 border bg-black/50 backdrop-blur-md
                ${sizeClasses[size]}
                ${celebrating ? 'scale-110' : ''}
                ${onClick ? 'cursor-pointer hover:bg-white/5 active:scale-95' : ''}
            `}
            style={{
                borderColor: celebrating ? '#39FF14' : NEON_CYAN,
                color: celebrating ? '#39FF14' : NEON_CYAN,
                boxShadow: celebrating ? `0 0 15px #39FF14` : `0 0 5px ${NEON_CYAN}40`
            }}
            title={`${coins} VoteQuest Coins`}
            onClick={onClick}
        >
            <div className={`
                w-2 h-2 rounded-full
                ${celebrating ? 'animate-pulse' : ''}
            `}
                style={{ backgroundColor: celebrating ? '#39FF14' : NEON_CYAN }}
            ></div>
            <span>{safeCoins.toLocaleString()}</span>
            {showLabel && <span className="opacity-70 text-[10px]">VQC</span>}
        </div>
    );
};

export default CoinBadge;
