'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VoteDistributionChartProps {
    options: Array<{
        id: string;
        title: string;
        votes?: number; // Weighted votes (QV)
        votes_count?: number; // Standard vote count (DB column name)
    }>;
}

export default function VoteDistributionChart({ options }: VoteDistributionChartProps) {
    // Sort by votes descending for better visualization
    const data = [...options]
        .sort((a, b) => (b.votes || b.votes_count || 0) - (a.votes || a.votes_count || 0))
        .map(opt => ({
            name: opt.title.length > 15 ? opt.title.substring(0, 15) + '...' : opt.title,
            fullName: opt.title,
            votes: opt.votes || opt.votes_count || 0
        }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-xl">
                    <p className="text-white font-medium mb-1">{payload[0].payload.fullName}</p>
                    <p className="text-blue-500 font-mono text-sm">
                        {payload[0].value.toLocaleString()} Votes
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px] mt-8 animate-fade-in">
            <h3 className="text-center text-mono-60 mb-6 text-sm uppercase tracking-wider">
                Current Standings (Weighted)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fill: '#ffffff', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                    <Bar
                        dataKey="votes"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index === 0 ? '#0055FF' : '#ffffff40'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
