import { useState } from 'react';
import { Calendar, Users, Shield, Plus, X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface CreateRoomWizardProps {
    organizationId: string;
    organizationName: string;
    userId: string;
    onComplete: (roomId: string) => void;
    onCancel: () => void;
}

export default function CreateRoomWizard({
    organizationId,
    organizationName,
    userId,
    onComplete,
    onCancel
}: CreateRoomWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [verificationTier, setVerificationTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier1');
    const [options, setOptions] = useState([
        { title: '', description: '' },
        { title: '', description: '' }
    ]);

    const tiers = [
        {
            value: 'tier1',
            name: 'Email Only',
            description: 'Anyone with an email can vote',
            icon: '📧',
            security: 'Basic',
            color: 'blue'
        },
        {
            value: 'tier2',
            name: 'Email + ID Number',
            description: 'Requires student/employee ID',
            icon: '🎓',
            security: 'Medium',
            color: 'purple'
        },
        {
            value: 'tier3',
            name: 'Email + Government ID',
            description: 'Upload photo ID for verification',
            icon: '🪪',
            security: 'High',
            color: 'green'
        }
    ];

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, { title: '', description: '' }]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, field: 'title' | 'description', value: string) => {
        const updated = [...options];
        updated[index][field] = value;
        setOptions(updated);
    };

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            alert('Please enter a room title');
            return;
        }

        const validOptions = options.filter(opt => opt.title.trim());
        if (validOptions.length < 2) {
            alert('Please provide at least 2 voting options');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationId,
                    title,
                    description,
                    verificationTier,
                    options: validOptions,
                    userId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create room');
            }

            console.log('Room created:', data.room);
            onComplete(data.room.id);

        } catch (error: any) {
            console.error('Error creating room:', error);
            alert(error.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
            <div className="card-elevated p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-display mb-2">Create Voting Room</h2>
                    <p className="text-mono-60">
                        {organizationName} • Private Election
                    </p>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-white text-black' : 'bg-white/10 text-mono-50'
                                }`}>
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </div>
                            {s < 3 && <div className="w-12 h-px bg-white/10"></div>}
                        </div>
                    ))}
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-mono-70 block mb-2">
                                Election Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Student Council President 2025"
                                className="input w-full"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-mono-70 block mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Vote for your next student council president. Voting closes December 15th."
                                className="input w-full h-24 resize-none"
                            />
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={onCancel} className="btn btn-secondary flex-1">
                                Cancel
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!title.trim()}
                                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Verification Tier */}
                {step === 2 && (
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-mono-70 block mb-4">
                            Who can vote? Choose verification level:
                        </label>

                        {tiers.map((tier) => {
                            const isSelected = verificationTier === tier.value;

                            return (
                                <button
                                    key={tier.value}
                                    onClick={() => setVerificationTier(tier.value as any)}
                                    className={`
                    w-full p-5 rounded-xl border-2 transition-all text-left
                    flex items-start gap-4 group
                    ${isSelected
                                            ? 'border-white bg-white/5'
                                            : 'border-white/10 hover:border-white/20'
                                        }
                  `}
                                >
                                    <div className="text-4xl">{tier.icon}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-white mb-1">{tier.name}</p>
                                        <p className="text-sm text-mono-60 mb-2">{tier.description}</p>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-mono-50" />
                                            <span className="text-xs text-mono-50">
                                                {tier.security} Security
                                            </span>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-5 h-5 text-white" />}
                                </button>
                            );
                        })}

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="btn btn-secondary flex-1"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Options */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium text-mono-70">
                                Voting Options (Candidates)
                            </label>
                            <button
                                onClick={addOption}
                                disabled={options.length >= 10}
                                className="btn btn-ghost btn-sm flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Option
                            </button>
                        </div>

                        <div className="space-y-3">
                            {options.map((option, index) => (
                                <div key={index} className="card p-4 bg-white/5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                value={option.title}
                                                onChange={(e) => updateOption(index, 'title', e.target.value)}
                                                placeholder={`Option ${index + 1} (e.g., Alice Johnson)`}
                                                className="input w-full"
                                            />
                                            <input
                                                type="text"
                                                value={option.description}
                                                onChange={(e) => updateOption(index, 'description', e.target.value)}
                                                placeholder="Optional description"
                                                className="input w-full text-sm"
                                            />
                                        </div>
                                        {options.length > 2 && (
                                            <button
                                                onClick={() => removeOption(index)}
                                                className="btn btn-ghost btn-sm p-2"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card p-4 bg-blue-500/10 border-blue-500/20">
                            <p className="text-sm text-mono-70">
                                💡 <strong>Tip:</strong> You can add up to 10 options. Voters will select one.
                            </p>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setStep(2)}
                                className="btn btn-secondary flex-1"
                                disabled={loading}
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || options.filter(o => o.title.trim()).length < 2}
                                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="loading-spinner w-4 h-4" />
                                        Creating Room...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Create Room
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
