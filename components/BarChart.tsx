import React, { useState } from 'react';

interface BarChartProps {
    data: {
        label: string;
        value: number;
        color?: string;
    }[];
    height?: number;
    maxValue?: number;
    showValues?: boolean;
    showGrid?: boolean;
    className?: string;
}

const BarChart: React.FC<BarChartProps> = ({
    data,
    height = 240,
    maxValue,
    showValues = true,
    showGrid = true,
    className = ''
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const max = maxValue || Math.max(...data.map(d => d.value));
    const barWidth = `${100 / data.length}%`;

    return (
        <div className={`w-full ${className}`}>
            <div
                className="relative w-full"
                style={{ height: `${height}px` }}
            >
                {/* Grid lines */}
                {showGrid && (
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div
                                key={i}
                                className="w-full border-t border-blue-500/10"
                            />
                        ))}
                    </div>
                )}

                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-around gap-2 px-2">
                    {data.map((item, index) => {
                        const barHeight = (item.value / max) * 100;
                        const isHovered = hoveredIndex === index;

                        return (
                            <div
                                key={index}
                                className="flex-1 flex flex-col items-center justify-end group cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Value tooltip */}
                                {showValues && isHovered && (
                                    <div className="mb-2 px-3 py-1.5 bg-gray-900 border border-blue-500/30 rounded-lg animate-fadeIn">
                                        <p className="text-xs font-bold text-blue-400">
                                            {item.value.toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                {/* Bar */}
                                <div
                                    className="w-full rounded-t-lg transition-all duration-500 ease-out relative overflow-hidden"
                                    style={{
                                        height: `${barHeight}%`,
                                        background: item.color || 'linear-gradient(180deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)',
                                        boxShadow: isHovered
                                            ? '0 0 20px rgba(0, 85, 255, 0.4)'
                                            : '0 0 10px rgba(0, 85, 255, 0.2)',
                                        transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                                        transformOrigin: 'bottom'
                                    }}
                                >
                                    {/* Shimmer effect */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"
                                        style={{
                                            animation: 'shimmer 2s infinite',
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Labels */}
            <div className="flex justify-around mt-4 px-2">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex-1 text-center"
                    >
                        <p className="text-xs text-gray-400 font-medium truncate px-1">
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0%, 100% {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    50% {
                        transform: translateY(-100%);
                        opacity: 0.3;
                    }
                }
            `}</style>
        </div>
    );
};

export default BarChart;
