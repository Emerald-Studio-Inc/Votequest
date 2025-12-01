// Animation utilities for smooth transitions and micro-interactions

export const animations = {
    // Fade animations
    fadeIn: 'animate-fade-in',
    fadeOut: 'animate-fade-out',

    // Slide animations
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    slideLeft: 'animate-slide-left',
    slideRight: 'animate-slide-right',

    // Scale animations
    scaleIn: 'animate-scale-in',
    scaleBounce: 'animate-scale-bounce',

    // Rotate animations
    spin: 'animate-spin',
    pulse: 'animate-pulse',

    // Custom timing
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
};

// Page transition hook
import { useEffect, useState } from 'react';

export function usePageTransition() {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const startTransition = () => setIsTransitioning(true);
    const endTransition = () => setIsTransitioning(false);

    return { isTransitioning, startTransition, endTransition };
}

// Scroll animation hook
export function useScrollAnimation() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return isVisible;
}

// Stagger animation helper
export function getStaggerDelay(index: number, baseDelay: number = 50) {
    return `${index * baseDelay}ms`;
}

// Hover scale animation
export const hoverScale = 'transition-transform hover:scale-105 active:scale-95';

// Button animations
export const buttonAnimations = {
    primary: 'transition-all hover:scale-105 active:scale-95',
    secondary: 'transition-colors hover:bg-white/10',
    ghost: 'transition-opacity hover:opacity-80',
};

// Card animations
export const cardAnimations = {
    hover: 'transition-all hover:border-white/20 hover:shadow-lg',
    clickable: 'transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
};

// Loading animations
export const loadingAnimations = {
    spinner: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
};
