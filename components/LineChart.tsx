import React, { useState } from 'react';

interface LineChartProps {
    data: {
        label: string;
        value: number;
    }[];
    height?: number;
    showArea?: boolean;
    showPoints?: boolean;
    showGrid?: boolean;
    className?: string;
}

const LineChart: React.FC<LineChartProps> = ({
    data,
    height = 200,
    showArea = true,
    showPoints = true,
    showGrid = true,
    className = ''
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const padding = 20;
    const chartHeight = height - (padding * 2);
    const chartWidth = 100; // percentage
    const pointSpacing = chartWidth / (data.length - 1 || 1);

    // Generate line path
    const points = data.map((d, i) => {
        const x = i * pointSpacing;
        const y = chartHeight - ((d.value - minValue) / range) * chartHeight;
        return { x, y, value: d.value, label: d.label };
    });

    const linePath = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    const areaPath = showArea
        ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L 0 ${chartHeight} Z`
        : '';

    return (
        <div className={`w-full ${className}`}>
            <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${chartWidth} ${height}`}
                preserveAspectRatio="none"
                className="overflow-visible"
            >
                {/* Grid lines */}
                {showGrid && (
                    <g className="opacity-20">
                        {[0, 1, 2, 3, 4].map(i => {
                            const y = (i / 4) * chartHeight + padding;
                            return (
                                <line
                                    key={i}
                                    x1="0"
                                    y1={y}
                                    x2={chartWidth}
                                    y2={y}
                                    stroke="rgba(255, 255, 255, 0.1)"
                                    strokeWidth="0.5"
                                    vectorEffect="non-scaling-stroke"
                                />
                            );
                        })}
                    </g>
                )}

                {/* Area fill */}
                {showArea && (
                    <path
                        d={areaPath}
                        fill="url(#lineGradient)"
                        opacity="0.2"
                        transform={`translate(0, ${padding})`}
                    />
                )}

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="url(#lineStroke)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    transform={`translate(0, ${padding})`}
                    style={{
                        filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.3))'
                    }}
                />

                {/* Points */}
                {showPoints && points.map((point, index) => (
                    <g
                        key={index}
                        transform={`translate(${point.x}, ${point.y + padding})`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="cursor-pointer"
                    >
                        <circle
                            r={hoveredIndex === index ? "2.5" : "1.5"}
                            fill="#fbbf24"
                            vectorEffect="non-scaling-stroke"
                            className="transition-all"
                            style={{
                                filter: hoveredIndex === index
                                    ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))'
                                    : 'none'
                            }}
                        />

                        {/* Tooltip */}
                        {hoveredIndex === index && (
                            <g transform="translate(0, -15)">
                                <rect
                                    x="-20"
                                    y="-20"
                                    width="40"
                                    height="18"
                                    rx="4"
                                    fill="#1a1a1a"
                                    stroke="#f59e0b"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                />
                                <text
                                    textAnchor="middle"
                                    y="-8"
                                    fill="#fbbf24"
                                    fontSize="10"
                                    fontWeight="600"
                                >
                                    {point.value}
                                </text>
                            </g>
                        )}
                    </g>
                ))}

                {/* Gradients */}
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                </defs>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-3 px-2">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="text-xs text-gray-500 font-medium"
                        style={{ width: `${100 / data.length}%`, textAlign: 'center' }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LineChart;
