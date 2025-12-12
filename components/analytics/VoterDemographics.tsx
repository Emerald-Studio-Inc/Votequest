'use client';

import React from 'react';

interface DemographicGroup {
    label: string;
    count: number;
    percentage: number;
}

interface VoterDemographicsProps {
    totalVoters: number;
    tiers: {
        tier1: number; // Email Verified
        tier2: number; // ID Verified
        tier3: number; // Gov ID Verified
    };
    levels: {
        new: number; // Level 1-5
        regular: number; // Level 6-20
        veteran: number; // Level 20+
    };
}

export default function VoterDemographics({ totalVoters, tiers, levels }: VoterDemographicsProps) {
    const verificationGroups: DemographicGroup[] = [
        { label: 'Basic (Email Only)', count: tiers.tier1, percentage: (tiers.tier1 / totalVoters) * 100 },
        { label: 'Verified (ID)', count: tiers.tier2, percentage: (tiers.tier2 / totalVoters) * 100 },
        { label: 'Advanced (Gov ID)', count: tiers.tier3, percentage: (tiers.tier3 / totalVoters) * 100 },
    ];

    const engagementGroups: DemographicGroup[] = [
        { label: 'New Voters (Lvl 1-5)', count: levels.new, percentage: (levels.new / totalVoters) * 100 },
        { label: 'Regulars (Lvl 6-20)', count: levels.regular, percentage: (levels.regular / totalVoters) * 100 },
        { label: 'Veterans (Lvl 20+)', count: levels.veteran, percentage: (levels.veteran / totalVoters) * 100 },
    ];

    const renderProgressBar = (percentage: number, colorClass: string) => (
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mt-2">
            <div
                className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Verification Tiers */}
            <div>
                <h3 className="text-sm font-bold text-mono-60 uppercase mb-4">Verification Levels</h3>
                <div className="space-y-6">
                    {verificationGroups.map((group) => (
                        <div key={group.label}>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-medium">{group.label}</span>
                                <div className="text-right">
                                    <span className="text-lg font-bold">{group.count.toLocaleString()}</span>
                                    <span className="text-xs text-mono-60 ml-1">({group.percentage.toFixed(1)}%)</span>
                                </div>
                            </div>
                            {renderProgressBar(group.percentage, 'bg-blue-500')}
                        </div>
                    ))}
                </div>
            </div>

            {/* Engagement Levels */}
            <div>
                <h3 className="text-sm font-bold text-mono-60 uppercase mb-4">User Engagement</h3>
                <div className="space-y-6">
                    {engagementGroups.map((group) => (
                        <div key={group.label}>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-medium">{group.label}</span>
                                <div className="text-right">
                                    <span className="text-lg font-bold">{group.count.toLocaleString()}</span>
                                    <span className="text-xs text-mono-60 ml-1">({group.percentage.toFixed(1)}%)</span>
                                </div>
                            </div>
                            {renderProgressBar(group.percentage, 'bg-purple-500')}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
