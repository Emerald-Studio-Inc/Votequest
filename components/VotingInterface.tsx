import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface VotingInterfaceProps {
    room: any;
    onVoteSubmit: (optionIds: string[]) => Promise<void>;
}

export default function VotingInterface({ room, onVoteSubmit }: VotingInterfaceProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleOptionToggle = (optionId: string) => {
        if (room.allow_multiple) {
            // Multiple choice
            setSelectedOptions(prev =>
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        } else {
            // Single choice
            setSelectedOptions([optionId]);
        }
    };

    const handleSubmit = async () => {
        if (selectedOptions.length === 0) {
            alert('Please select at least one option');
            return;
        }

        if (!confirm('Submit your vote? This action cannot be undone.')) {
            return;
        }

        try {
            setSubmitting(true);
            await onVoteSubmit(selectedOptions);
        } catch (error) {
            console.error('Vote submission error:', error);
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-heading mb-2 gold-text">Cast Your Vote</h2>
                <p className="text-body text-mono-60">
                    {room.allow_multiple
                        ? 'Select one or more options'
                        : 'Select one option'}
                </p>
            </div>

            <div className="space-y-4 mb-8">
                {room.room_options?.map((option: any, index: number) => {
                    const isSelected = selectedOptions.includes(option.id);

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionToggle(option.id)}
                            disabled={submitting}
                            className={`
                w-full text-left p-6 rounded-xl transition-all
                ${isSelected
                                    ? 'bg-white/10 border-white/30 backdrop-blur-md shadow-xl'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm'
                                }
              `}
                        >
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                {/* Header: Indicator + Image (Row on mobile) */}
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    {/* Selection Indicator */}
                                    <div className="flex-shrink-0 pt-1">
                                        {isSelected ? (
                                            <CheckCircle className="w-6 h-6 gold-text" strokeWidth={2.5} />
                                        ) : (
                                            <Circle className="w-6 h-6 text-mono-40" strokeWidth={2} />
                                        )}
                                    </div>

                                    {/* Option Number or Image */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${!option.image_url ? 'bg-white/5 border border-white/10' : ''}`}>
                                        {option.image_url ? (
                                            <img
                                                src={option.image_url}
                                                alt={option.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span className={`font-bold ${isSelected ? 'gold-text' : 'text-mono-60'}`}>
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Mobile Title (visible only on mobile) */}
                                    <h3 className="sm:hidden font-medium text-lg text-white ml-2">
                                        {option.title}
                                    </h3>
                                </div>

                                {/* Option Content (Desktop Layout / Description on Mobile) */}
                                <div className="flex-1 w-full pl-0 sm:pl-0">
                                    <h3 className="hidden sm:block font-medium text-lg mb-1 text-white">
                                        {option.title}
                                    </h3>
                                    {option.description ? (
                                        <div className="text-sm text-mono-60 bg-white/5 p-3 rounded-lg mt-2 w-full">
                                            {option.description}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-mono-40 italic mt-1">
                                            No bio provided
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-0 left-0 right-0 p-6 bg-black/80 backdrop-blur-xl border-t border-white/10">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedOptions.length === 0 || submitting}
                        className="btn-gold w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <div className="loading-spinner w-5 h-5" />
                                Submitting Vote...
                            </>
                        ) : (
                            `Submit Vote${selectedOptions.length > 1 ? 's' : ''} (${selectedOptions.length})`
                        )}
                    </button>
                    <p className="text-sm text-center text-mono-50 mt-3">
                        Your vote is anonymous and cannot be changed
                    </p>
                </div>
            </div>
        </div>
    );
}
