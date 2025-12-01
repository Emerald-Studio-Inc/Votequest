// Mobile responsiveness utilities and hooks

import { useState, useEffect } from 'react';

// Breakpoints (matching Tailwind defaults)
export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

// Hook to detect current breakpoint
export function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState<keyof typeof breakpoints>('2xl');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < breakpoints.sm) setBreakpoint('sm');
            else if (width < breakpoints.md) setBreakpoint('md');
            else if (width < breakpoints.lg) setBreakpoint('lg');
            else if (width < breakpoints.xl) setBreakpoint('xl');
            else setBreakpoint('2xl');
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return breakpoint;
}

// Hook to detect mobile
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoints.md);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

// Touch gesture utilities
export function useTouchGesture() {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        return { isLeftSwipe, isRightSwipe, distance };
    };

    return { onTouchStart, onTouchMove, onTouchEnd };
}

// Responsive class helper
export function responsive(
    base: string,
    sm?: string,
    md?: string,
    lg?: string,
    xl?: string
) {
    const classes = [base];
    if (sm) classes.push(`sm:${sm}`);
    if (md) classes.push(`md:${md}`);
    if (lg) classes.push(`lg:${lg}`);
    if (xl) classes.push(`xl:${xl}`);
    return classes.join(' ');
}

// Mobile-optimized tap targets
export const tapTarget = 'min-h-[44px] min-w-[44px]'; // iOS recommended size

// Mobile navigation helper
export function useMobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    // Close on route change
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return { isOpen, toggle, close };
}
