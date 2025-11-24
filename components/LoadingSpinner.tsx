import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
    overlay?: boolean;
    fullscreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    message,
    overlay = false,
    fullscreen = false
}) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2
                className={`${sizeClasses[size]} animate-spin text-purple-500`}
                strokeWidth={2.5}
            />
            {message && (
                <p className="text-sm text-zinc-400 animate-pulse">{message}</p>
            )}
        </div>
    );

    if (fullscreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
