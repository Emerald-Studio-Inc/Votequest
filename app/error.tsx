'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            {/* Minimal Background */}
            <div className="absolute inset-0 bg-noise opacity-50 pointer-events-none"></div>

            <div className="relative z-10 max-w-md w-full glass-medium rounded-2xl p-8 border border-white/5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>

                <h2 className="text-2xl font-bold mb-3 tracking-tight">Something went wrong</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    We encountered an unexpected error. Please try again or contact support if the problem persists.
                </p>

                <button
                    onClick={() => reset()}
                    className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </button>
            </div>
        </div>
    );
}
