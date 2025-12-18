import React from 'react';

interface CircularChartProps {
    value: number; // 0-100 percentage
    max?: number;
    label: string;
    size?: 'sm' | 'md' | 'lg';
    strokeWidth?: 'thin' | 'medium' | 'thick';
    showPercentage?: boolean;
    className?: string;
}

const CircularChart: React.FC<CircularChartProps> = ({
    value,
    max = 100,
    label,
    size = 'md',
    strokeWidth = 'medium',
    showPercentage = true,
    className = ''
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    // Size configurations
    const sizes = {
        sm: { width: 120, stroke: 8, fontSize: '1.5rem', labelSize: '0.75rem' },
        md: { width: 180, stroke: 12, fontSize: '2rem', labelSize: '0.875rem' },
        lg: { width: 240, stroke: 16, fontSize: '2.5rem', labelSize: '1rem' }
    };

    const strokeWidths = {
        thin: 0.7,
        medium: 1,
        thick: 1.3
    };

    const config = sizes[size];
    const adjustedStroke = config.stroke * strokeWidths[strokeWidth];
    const radius = (config.width / 2) - (adjustedStroke / 2) - 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`inline-flex flex-col items-center ${className}`}>
            <svg
                width={config.width}
                height={config.width}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={config.width / 2}
                    cy={config.width / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(0, 85, 255, 0.1)"
                    strokeWidth={adjustedStroke}
                />

                {/* Progress circle with gold gradient */}
                <circle
                    cx={config.width / 2}
                    cy={config.width / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#blueGradient)"
                    strokeWidth={adjustedStroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                        filter: 'drop-shadow(0 0 8px rgba(0, 85, 255, 0.4))'
                    }}
                />

                {/* Center text */}
                <text
                    x={config.width / 2}
                    y={config.width / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="transform rotate-90"
                    style={{
                        transformOrigin: 'center',
                        fontSize: config.fontSize,
                        fontWeight: 'bold',
                        fill: '#fff'
                    }}
                >
                    {showPercentage ? `${Math.round(percentage)}%` : value.toLocaleString()}
                </text>

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Label */}
            <p
                className="mt-3 text-gray-400 font-medium text-center"
                style={{ fontSize: config.labelSize }}
            >
                {label}
            </p>
        </div>
    );
};

export default CircularChart;
