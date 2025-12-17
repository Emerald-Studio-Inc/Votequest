'use client';

export const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (typeof window === 'undefined' || !window.navigator?.vibrate) return;

    switch (pattern) {
        case 'light':
            window.navigator.vibrate(5); // Very brief tick
            break;
        case 'medium':
            window.navigator.vibrate(15);
            break;
        case 'heavy':
            window.navigator.vibrate(30);
            break;
        case 'success':
            window.navigator.vibrate([10, 30, 10]); // Da-DA-da
            break;
        case 'error':
            window.navigator.vibrate([50, 30, 50]); // Buzz-buzz
            break;
    }
};
