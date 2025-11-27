import React from 'react';

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value }) => {
    return (
        <div className="card p-6">
            <div className="flex items-center gap-4">
                {/* Icon Container */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <div className="text-gold-400">
                        {icon}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">{label}</div>
                    <div className="text-2xl font-bold text-white">{value}</div>
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
