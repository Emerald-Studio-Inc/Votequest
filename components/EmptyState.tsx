'use client';

import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
            {icon && (
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-scale-bounce">
                    {icon}
                </div>
            )}

            <h3 className="text-xl font-semibold text-white mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-mono-60 max-w-md mb-6 leading-relaxed">
                    {description}
                </p>
            )}

            {action && (
                <button onClick={action.onClick} className="btn btn-primary btn-sm">
                    {action.label}
                </button>
            )}
        </div>
    );
}
