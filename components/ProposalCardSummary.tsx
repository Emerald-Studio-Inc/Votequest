import React from 'react';

interface ProposalCardSummaryProps {
    number: string;
    title: string;
    status: 'Active' | 'Closed';
    yesPercent: number;
    noPercent: number;
    endsIn: string;
}

const ProposalCardSummary: React.FC<ProposalCardSummaryProps> = ({
    number,
    title,
    status,
    yesPercent,
    noPercent,
    endsIn
}) => {
    return (
        <div className="card p-6 mb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                    Proposal {number}: {title}
                </h3>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
                    <div
                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-full transition-all duration-500"
                        style={{ width: `${yesPercent}%` }}
                    />
                    <div
                        className="bg-gray-700 h-full transition-all duration-500"
                        style={{ width: `${noPercent}%` }}
                    />
                </div>
            </div>

            {/* Stats Footer */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                    <span className="text-emerald-400">Status: {status}</span>
                    <span className="text-gray-400">
                        Votes: <span className="text-white font-medium">{yesPercent}% Yes</span> / {noPercent}% No
                    </span>
                </div>
                <span className="text-gray-500">Ends in: {endsIn}</span>
            </div>
        </div>
    );
};

export default ProposalCardSummary;
