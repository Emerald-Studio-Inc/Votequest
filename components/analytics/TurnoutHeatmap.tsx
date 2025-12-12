'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TurnoutHeatmapProps {
    data?: { hour: string; votes: number }[];
}

// Dummy data if none provided
const DEFAULT_DATA = [
    { hour: '00:00', votes: 12 },
    { hour: '02:00', votes: 5 },
    { hour: '04:00', votes: 2 },
    { hour: '06:00', votes: 8 },
    { hour: '08:00', votes: 45 },
    { hour: '10:00', votes: 120 },
    { hour: '12:00', votes: 210 },
    { hour: '14:00', votes: 180 },
    { hour: '16:00', votes: 156 },
    { hour: '18:00', votes: 95 },
    { hour: '20:00', votes: 140 },
    { hour: '22:00', votes: 60 },
];

export default function TurnoutHeatmap({ data = DEFAULT_DATA }: TurnoutHeatmapProps) {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis
                        dataKey="hour"
                        stroke="#ffffff40"
                        tick={{ fill: '#ffffff40', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#ffffff40"
                        tick={{ fill: '#ffffff40', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#000000',
                            borderColor: '#ffffff20',
                            borderRadius: '8px',
                            color: '#ffffff'
                        }}
                        itemStyle={{ color: '#ffffff' }}
                        cursor={{ fill: '#ffffff05' }}
                    />
                    <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index % 2 === 0 ? '#fbbf24' : '#d97706'}
                                fillOpacity={0.8}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
