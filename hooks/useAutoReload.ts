// Auto-reload detection hook
// Checks for new deployments every 5 minutes and auto-reloads
import { useEffect } from 'react';

export function useAutoReload() {
    useEffect(() => {
        // Only in production
        if (process.env.NODE_ENV !== 'production') return;

        const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
        let buildId: string | null = null;

        const checkForUpdates = async () => {
            try {
                // Fetch a cachebuster endpoint
                const res = await fetch('/_next/static/BUILD_ID?' + Date.now());
                const newBuildId = await res.text();

                if (buildId === null) {
                    buildId = newBuildId;
                } else if (buildId !== newBuildId) {
                    console.log('[AUTO-RELOAD] New version detected, reloading...');
                    window.location.reload();
                }
            } catch (e) {
                // Silently fail
            }
        };

        // Check immediately and then every 5 minutes
        checkForUpdates();
        const interval = setInterval(checkForUpdates, CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, []);
}
