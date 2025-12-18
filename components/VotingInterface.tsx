import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import ArcadeButton from './ArcadeButton';

interface VotingInterfaceProps {
    room: any;
    onVoteSubmit: (optionIds: string[]) => Promise<void>;
}

export default function VotingInterface({ room, onVoteSubmit }: VotingInterfaceProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [voteWeights, setVoteWeights] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);

    const isQuadratic = room.voting_strategy === 'quadratic';

    const handleOptionToggle = (optionId: string) => {
        if (room.allow_multiple || isQuadratic) {
            // Multiple choice OR Quadratic (always inherently multi)
            setSelectedOptions(prev => {
                const isSelected = prev.includes(optionId);
                if (isSelected) {
                    // Deselect: remove from selected and weights
                    const newWeights = { ...voteWeights };
                    delete newWeights[optionId];
                    setVoteWeights(newWeights);
                    return prev.filter(id => id !== optionId);
                } else {
                    // Select: add with default weight 1
                    setVoteWeights(prevW => ({ ...prevW, [optionId]: 1 }));
                    return [...prev, optionId];
                }
            });
        } else {
            // Single choice
            setSelectedOptions([optionId]);
            setVoteWeights({ [optionId]: 1 });
        }
    };

    const handleWeightChange = (optionId: string, weight: number) => {
        setVoteWeights(prev => ({
            ...prev,
            [optionId]: weight
        }));
    };

    const totalCost = Object.values(voteWeights).reduce((sum, w) => sum + (w * w), 0);

    const handleSubmit = async () => {
        if (selectedOptions.length === 0) {
            alert('Please select at least one option');
            return;
        }

        let confirmMsg = 'Submit your vote? This action cannot be undone.';
        if (isQuadratic) {
            confirmMsg = `Submit votes? Total Cost: ${totalCost} VQC.`;
        }

        if (!confirm(confirmMsg)) {
            return;
        }

        try {
            setSubmitting(true);

            if (isQuadratic) {
                // Submit weighted payload
                const payload = selectedOptions.map(id => ({
                    optionId: id,
                    count: voteWeights[id] || 1
                }));
                await onVoteSubmit(payload as any);
            } else {
                // Submit standard payload
                await onVoteSubmit(selectedOptions as any);
            }
        } catch (error) {
            console.error('Vote submission error:', error);
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-heading mb-2 text-blue-400">Cast Your Vote</h2>
                <div className="flex justify-between items-end">
                    <p className="text-body text-mono-60">
                        {isQuadratic
                            ? 'Quadratic Voting: Adjustable weights (Cost = Votes²)'
                            : (room.allow_multiple ? 'Select one or more options' : 'Select one option')}
                    </p>
                    {isQuadratic && (
                        <div className="text-right">
                            <span className="text-sm text-mono-50 uppercase tracking-widest">Total Cost</span>
                            <div className="text-2xl font-bold text-white font-mono">{totalCost} <span className="text-blue-500 text-sm">VQC</span></div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {room.room_options?.map((option: any, index: number) => {
                    const isSelected = selectedOptions.includes(option.id);
                    const weight = voteWeights[option.id] || 1;
                    const cost = weight * weight;

                    return (
                        <div
                            key={option.id}
                            className={`
                                rounded-xl transition-all border
                                ${isSelected
                                    ? 'bg-white/10 border-white/30 backdrop-blur-md shadow-xl'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm'
                                }
                            `}
                        >
                            <button
                                onClick={() => handleOptionToggle(option.id)}
                                disabled={submitting}
                                className="w-full text-left p-6"
                            >
                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="flex-shrink-0 pt-1">
                                            {isSelected ? (
                                                <CheckCircle className="w-6 h-6 text-blue-400" strokeWidth={2.5} />
                                            ) : (
                                                <Circle className="w-6 h-6 text-mono-40" strokeWidth={2} />
                                            )}
                                        </div>

                                        <div className={`bg-[var(--bg-void)] min-h-[400px] flex items-center justify-center rounded-xl border border-blue-500/20 ${!option.image_url ? 'bg-white/5 border border-white/10' : ''}`}>
                                            {option.image_url ? (
                                                <img
                                                    src={option.image_url}
                                                    alt={option.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <span className={`font-bold ${isSelected ? 'text-blue-400' : 'text-mono-60'}`}>
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="sm:hidden font-medium text-lg text-white ml-2">{option.title}</h3>
                                    </div>

                                    <div className="flex-1 w-full pl-0 sm:pl-0">
                                        <h3 className="hidden sm:block font-medium text-lg mb-1 text-white">{option.title}</h3>
                                        {option.description ? (
                                            <div className="text-sm text-mono-60 bg-white/5 p-3 rounded-lg mt-2 w-full">
                                                {option.description}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-mono-40 italic mt-1">No bio provided</div>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* QUADRATIC SLIDER UI */}
                            {isSelected && isQuadratic && (
                                <div className="px-6 pb-6 pt-2 border-t border-white/10 mt-2 animate-slide-down">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm text-mono-60">Voting Power</label>
                                        <div className="text-right">
                                            <span className="text-white font-bold font-mono">{weight} Votes</span>
                                            <span className="text-mono-50 text-xs ml-2">({cost} coins)</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={weight}
                                        onChange={(e) => handleWeightChange(option.id, parseInt(e.target.value))}
                                        className="w-full accent-blue-500 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-mono-40 mt-1">
                                        <span>1 (1c)</span>
                                        <span>5 (25c)</span>
                                        <span>10 (100c)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-0 left-0 right-0 p-6 bg-black/80 backdrop-blur-xl border-t border-white/10">
                <div className="max-w-4xl mx-auto">
                    <ArcadeButton
                        onClick={handleSubmit}
                        disabled={selectedOptions.length === 0 || submitting}
                        variant="lime"
                        size="lg"
                        className="w-full flex items-center justify-center gap-3"
                        tooltip={isQuadratic ? `Cost: ${totalCost} VQC` : "Submit your final decision"}
                    >
                        {submitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" />
                                PROCESSING...
                            </>
                        ) : (
                            isQuadratic
                                ? `EXECUTE_VOTE (${totalCost} VQC)`
                                : `CONFIRM_SELECTION${selectedOptions.length > 1 ? 'S' : ''} (${selectedOptions.length})`
                        )}
                    </ArcadeButton>
                    <p className="text-sm text-center text-mono-50 mt-3 font-mono">
                        // CAUTION: ACTION_IRREVERSIBLE
                    </p>
                </div>
            </div>
        </div>
    );
}
