import React from 'react';

// Neon cyan hex - guaranteed to work
const NEON_CYAN = '#00F0FF';

interface CyberCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    title?: string; // Optional header title like a terminal window
    cornerStyle?: 'tech' | 'simple' | 'round'; // Added to support prop usage
    style?: React.CSSProperties;
    onClick?: () => void;
}

export default function CyberCard({
    children,
    className = '',
    hoverEffect = true,
    title,
    cornerStyle = 'tech',
    onClick,
    style
}: CyberCardProps) {
    return (
        <div className={`
            cyber-card relative p-6 rounded-none
            ${hoverEffect ? 'hover:translate-y-[-2px] transition-transform duration-300' : ''}
            ${className}
        `}
            style={style}
            onClick={onClick ? onClick : undefined}>
            {/* Tech Corners - using inline styles for guaranteed visibility */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l opacity-60" style={{ borderColor: NEON_CYAN }}></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r opacity-60" style={{ borderColor: NEON_CYAN }}></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l opacity-60" style={{ borderColor: NEON_CYAN }}></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r opacity-60" style={{ borderColor: NEON_CYAN }}></div>

            {/* Optional Terminal Header */}
            {title && (
                <div
                    className="absolute top-0 left-0 right-0 h-8 flex items-center px-4"
                    style={{ backgroundColor: `${NEON_CYAN}15`, borderBottom: `1px solid ${NEON_CYAN}50` }}
                >
                    <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: NEON_CYAN }}>
                        // {title}
                    </span>
                    <div className="ml-auto flex gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${NEON_CYAN}80` }}></div>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${NEON_CYAN}50` }}></div>
                    </div>
                </div>
            )}

            {/* Content (Padded if title exists) */}
            <div className={`relative z-10 ${title ? 'mt-4' : ''}`}>
                {children}
            </div>

            {/* Background Grid Texture (Subtle) */}
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none z-0"></div>
        </div>
    );
}

