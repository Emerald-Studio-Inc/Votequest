'use client';

import React from 'react';
import { sfx } from '@/lib/sfx';
import { triggerHaptic } from '@/lib/haptics';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary';
    as?: 'button' | 'div';
}

const CyberButton = ({
    children,
    className = '',
    variant = 'primary',
    onClick,
    as = 'button',
    ...props
}: CyberButtonProps) => {

    const Component = as;
    const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
        sfx.playClick();
        triggerHaptic('light');
        if (onClick) onClick(e as React.MouseEvent<HTMLButtonElement>);
    };

    const handleMouseEnter = () => {
        sfx.playHover();
    };

    return (
        <Component
            className={`btn-premium ${className}`}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            {...(props as any)}
        >
            <div className="dots_border"></div>
            <svg
                viewBox="0 0 24 24"
                className="sparkle"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    className="path"
                    d="M12 3V4M12 20V21M4 12H3M21 12H20M18.364 5.63604L17.6569 6.34315M6.34315 17.6569L5.63604 18.364M18.364 18.364L17.6569 17.6569M6.34315 6.34315L5.63604 5.63604"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="text_button">{children}</span>
        </Component>
    );
};

export default CyberButton;
