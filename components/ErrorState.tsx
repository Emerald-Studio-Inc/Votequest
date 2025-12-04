'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export default function ErrorState({
    title = 'Something went wrong',
    message = 'We encountered an error. Please try again.',
    onRetry
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center mb-6 animate-scale-bounce">
                <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
                {title}
            </h3>

            <p className="text-sm text-mono-60 max-w-md mb-6 leading-relaxed">
                {message}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="btn btn-secondary flex items-center gap-2"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </div>
    );
}
