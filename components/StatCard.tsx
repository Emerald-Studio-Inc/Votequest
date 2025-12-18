import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    iconColor?: string;
    iconBgColor?: string;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    label,
    value,
    trend,
    iconColor = 'text-blue-400',
    iconBgColor = 'bg-blue-500/10',
    className = ''
}) => {
    return (
        <div className={`card group hover:scale-105 ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${iconBgColor}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {label}
                </span>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <p className="text-sm text-gray-400">{label}</p>
                </div>

                {trend && (
                    <div className={`flex items-center gap-2 text-xs ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {trend.isPositive ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            )}
                        </svg>
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
