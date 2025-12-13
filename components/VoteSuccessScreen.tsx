import { CheckCircle, Share2, Download } from 'lucide-react';
import ArcadeButton from './ArcadeButton';

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
        <div className="min-h-screen flex items-center justify-center px-6 bg-black">
            <div className="max-w-2xl w-full text-center">
                {/* Success Icon */}
                <div className="mb-8 animate-scale-bounce">
                    <div className="w-24 h-24 mx-auto rounded-full bg-white/5 border-2 gold-border-animated flex items-center justify-center gold-glow-intense">
                        <CheckCircle className="w-12 h-12 gold-text" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-display mb-4 gold-text animate-fade-in">
                    Vote Submitted!
                </h1>

                <p className="text-body-large text-mono-70 mb-8 animate-slide-up">
                    Thank you for participating in this election. Your vote has been securely recorded.
                </p>

                {/* Voted Options */}
                <div className="card-gold p-8 mb-8 gold-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <p className="text-sm text-mono-60 uppercase tracking-wider mb-4">You voted for:</p>
                    <div className="space-y-2">
                        {optionTitles.map((title, index) => (
                            <div key={index} className="text-lg font-medium gold-text">
                                {title}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="card p-6 gold-border">
                        <p className="text-sm text-mono-60 mb-2">Your vote is</p>
                        <p className="font-bold gold-text">100% Anonymous</p>
                    </div>
                    <div className="card p-6 gold-border">
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
                    <ArcadeButton
                        onClick={() => window.location.reload()}
                        variant="cyan"
                        className="w-full sm:w-auto"
                    >
                        VIEW_RESULTS
                    </ArcadeButton>
                    <ArcadeButton
                        onClick={() => {
                            const url = window.location.href;
                            if (navigator.share) {
                                navigator.share({ title: room.title, url });
                            } else {
                                navigator.clipboard.writeText(url);
                                // Toast would be better but alert is minimal fallback as per original code
                                alert('Link copied to clipboard!');
                            }
                        }}
                        variant="magenta"
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        SHARE_ELECTION
                    </ArcadeButton>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5">
                    <p className="text-sm text-mono-50">
                        Powered by <span className="gold-text font-bold">VoteQuest</span> Institutional Voting
                    </p>
                </div>
            </div>
        </div>
    );
}
