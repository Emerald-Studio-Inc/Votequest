import { CheckCircle, Share2, Download } from 'lucide-react';
import CyberButton from './CyberButton';

import VoteDistributionChart from './VoteDistributionChart';

interface VoteSuccessScreenProps {
    room: any;
    votedOptions: string[];
}

export default function VoteSuccessScreen({ room, votedOptions }: VoteSuccessScreenProps) {
    const optionTitles = votedOptions
        .map(id => room.room_options?.find((opt: any) => opt.id === id))
        .filter(Boolean)
        .map((opt: any) => opt.title);

    return (
        <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="max-w-2xl w-full text-center">
                {/* Success Icon */}
                <div className="mb-8 animate-scale-bounce">
                    <div className="w-24 h-24 mx-auto rounded-full bg-white/5 border-2 border-blue-500 shadow-[0_0_30px_#0055FF] flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-blue-500" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-display mb-4 text-blue-500 animate-fade-in">
                    Vote Submitted!
                </h1>

                <p className="text-body-large text-mono-70 mb-8 animate-slide-up">
                    Thank you for participating in this election. Your vote has been securely recorded.
                </p>

                {/* Voted Options */}
                <div className="bg-black/80 border border-blue-500/50 rounded-xl p-8 mb-8 shadow-[0_0_20px_rgba(0,85,255,0.3)] animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <p className="text-sm text-mono-60 uppercase tracking-wider mb-4">You voted for:</p>
                    <div className="space-y-2">
                        {optionTitles.map((title, index) => (
                            <div key={index} className="text-lg font-medium text-blue-500">
                                {title}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="card p-6 border-blue-500/30">
                        <p className="text-sm text-mono-60 mb-2">Your vote is</p>
                        <p className="font-bold text-blue-500">100% Anonymous</p>
                    </div>
                    <div className="card p-6 border-blue-500/30">
                        <p className="text-sm text-mono-60 mb-2">Vote recorded at</p>
                        <p className="font-medium text-white">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>

                {/* Vote Distribution Chart */}
                {room.room_options && (
                    <div className="card bg-white/5 border border-white/5 p-4 mb-8">
                        <VoteDistributionChart options={room.room_options} />
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <CyberButton
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto"
                    >
                        VIEW_RESULTS
                    </CyberButton>
                    <CyberButton
                        onClick={() => {
                            const url = window.location.href;
                            if (navigator.share) {
                                navigator.share({ title: room.title, url });
                            } else {
                                navigator.clipboard.writeText(url);
                                alert('Link copied to clipboard!');
                            }
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        SHARE_ELECTION
                    </CyberButton>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5">
                    <p className="text-sm text-mono-50">
                        Powered by <span className="text-blue-500 font-bold">VoteQuest</span> Institutional Voting
                    </p>
                </div>
            </div>
        </div>
    );
}
