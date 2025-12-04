'use client';

import React, { useState, useRef, useEffect } from 'react';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    rippleColor?: string;
}

export default function RippleButton({
    children,
    rippleColor = 'rgba(255, 255, 255, 0.3)',
    className = '',
    onClick,
    ...props
}: RippleButtonProps) {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
        }, 600);

        // Call original onClick
        if (onClick) onClick(event);
    };

    return (
        <button
            ref={buttonRef}
            className={`relative overflow-hidden ${className}`}
            onClick={createRipple}
            {...props}
        >
            {children}

            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none animate-ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: '100%',
                        height: '100%',
                        transform: 'scale(0)',
                        backgroundColor: rippleColor,
                    }}
                />
            ))}

            <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
      `}</style>
        </button>
    );
}
