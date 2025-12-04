'use client';

import React, { useState, useEffect } from 'react';

interface CountUpProps {
    end: number;
    start?: number;
    duration?: number;
    decimals?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export default function CountUp({
    end,
    start = 0,
    duration = 1000,
    decimals = 0,
    suffix = '',
    prefix = '',
    className = ''
}: CountUpProps) {
    const [count, setCount] = useState(start);

    useEffect(() => {
        let startTime: number | null = null;
        const startValue = start;
        const endValue = end;
        const difference = endValue - startValue;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease-out cubic function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentCount = startValue + (difference * easeOut);

            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [end, start, duration]);

    const formattedValue = count.toFixed(decimals);

    return (
        <span className={className}>
            {prefix}{formattedValue}{suffix}
        </span>
    );
}
