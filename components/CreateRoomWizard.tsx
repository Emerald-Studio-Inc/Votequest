import { useState } from 'react';
import { Calendar, Users, Shield, Plus, X, ArrowRight, ArrowLeft, Check, Terminal, Database, Lock } from 'lucide-react';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface CreateRoomWizardProps {
    organizationId: string;
    organizationName: string;
    userId: string;
    onComplete: (roomId: string) => void;
    onCancel: () => void;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

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
        { title: '', description: '', imageUrl: '' },
        { title: '', description: '', imageUrl: '' }
    ]);

    const tiers = [
        {
            value: 'tier1',
            name: 'BASIC_ACCESS',
            icon: Users,
            description: 'OPEN_PROTOCOL_ACCESS',
            security: 'LOW_SECURITY'
        },
        {
            value: 'tier2',
            name: 'VERIFIED_ID',
            icon: Database,
            description: 'EMAIL_VERIFICATION_REQUIRED',
            security: 'MED_SECURITY'
        },
        {
            value: 'tier3',
            name: 'STRICT_MODE',
            icon: Lock,
            description: 'GOV_ID_REQUIRED',
            security: 'HIGH_SECURITY'
        }
    ];

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, { title: '', description: '', imageUrl: '' }]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, field: 'title' | 'description' | 'imageUrl', value: string) => {
        const updated = [...options];
        updated[index][field] = value;
        setOptions(updated);
    };

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            alert('SYSTEM_ERROR: TITLE_REQUIRED');
            return;
        }

        const validOptions = options.filter(opt => opt.title.trim());
        if (validOptions.length < 2) {
            alert('SYSTEM_ERROR: MINIMUM_2_OPTIONS_REQUIRED');
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
                    options: validOptions.map(o => ({
                        title: o.title,
                        description: o.description,
                        image_url: o.imageUrl
                    })),
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:px-6 font-mono overflow-y-auto custom-scrollbar">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <CyberCard
                className="w-full max-w-3xl relative z-10"
                title="CHAMBER_CREATION_PROTOCOL"
                cornerStyle="tech"
            >
                <div className="p-4 sm:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="mb-8 border-b pb-4" style={{ borderColor: `${NEON_CYAN}30` }}>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 uppercase glitch-text" data-text="INITIALIZE_VOTING_CHAMBER">INITIALIZE_VOTING_CHAMBER</h2>
                        <p className="text-gray-400 font-mono text-sm flex items-center gap-2">
                            <Terminal className="w-4 h-4" style={{ color: NEON_CYAN }} />
                            <span style={{ color: NEON_CYAN }}>{organizationName}</span>
                            <span className="text-gray-600">{'>>'}</span>
                            <span>SECURE_ELECTION_MODULE</span>
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-4 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className="w-8 h-8 flex items-center justify-center border transition-all duration-300"
                                    style={{
                                        borderColor: step >= s ? NEON_CYAN : 'rgba(255,255,255,0.1)',
                                        backgroundColor: step >= s ? `${NEON_CYAN}20` : 'transparent',
                                        color: step >= s ? NEON_CYAN : 'gray'
                                    }}>
                                    {step > s ? <Check className="w-5 h-5" /> : s}
                                </div>
                                {s < 3 && <div className="w-12 h-px transition-colors duration-300" style={{ backgroundColor: step > s ? NEON_CYAN : 'rgba(255,255,255,0.1)' }}></div>}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-slide-up">
                            <div>
                                <label className="text-xs font-bold font-mono text-gray-400 block mb-2 uppercase" style={{ color: NEON_CYAN }}>
                                    {'>'} ELECTION_TITLE *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="ENTER_TITLE_HERE..."
                                    className="w-full bg-black border p-3 text-white font-mono focus:outline-none transition-all placeholder-gray-700"
                                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                    onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold font-mono text-gray-400 block mb-2 uppercase" style={{ color: NEON_CYAN }}>
                                    {'>'} PROTOCOL_DESCRIPTION
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="ENTER_MISSION_BRIEF..."
                                    className="w-full bg-black border p-3 text-white font-mono focus:outline-none transition-all h-32 resize-none placeholder-gray-700"
                                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                    onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <ArcadeButton onClick={onCancel} variant="cyan" className="flex-1">
                                    ABORT
                                </ArcadeButton>
                                <ArcadeButton
                                    onClick={() => setStep(2)}
                                    disabled={!title.trim()}
                                    variant="cyan"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    PROCEED <ArrowRight className="w-4 h-4" />
                                </ArcadeButton>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Verification Tier */}
                    {step === 2 && (
                        <div className="space-y-4 animate-slide-up">
                            <label className="text-xs font-bold font-mono text-gray-400 block mb-4 uppercase" style={{ color: NEON_CYAN }}>
                                {'>'} SECURITY_CLEARANCE_LEVEL
                            </label>

                            {tiers.map((tier) => {
                                const isSelected = verificationTier === tier.value;
                                const Icon = tier.icon;

                                return (
                                    <button
                                        key={tier.value}
                                        onClick={() => setVerificationTier(tier.value as any)}
                                        className="w-full p-4 sm:p-5 border transition-all text-left flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group relative overflow-hidden"
                                        style={{
                                            borderColor: isSelected ? NEON_CYAN : 'rgba(255,255,255,0.1)',
                                            backgroundColor: isSelected ? `${NEON_CYAN}05` : 'transparent'
                                        }}
                                    >
                                        {isSelected && <div className="absolute inset-0 bg-cyan-400/5 animate-pulse pointer-events-none" />}

                                        <div className="w-10 h-10 flex items-center justify-center border"
                                            style={{
                                                borderColor: isSelected ? NEON_CYAN : 'rgba(255,255,255,0.1)',
                                                color: isSelected ? NEON_CYAN : 'gray'
                                            }}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-bold text-white mb-1 font-mono uppercase tracking-wider" style={{ color: isSelected ? NEON_CYAN : 'white' }}>{tier.name}</p>
                                            <p className="text-xs text-gray-500 mb-2 font-mono uppercase">{tier.description}</p>
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-3 h-3" style={{ color: isSelected ? NEON_LIME : 'gray' }} />
                                                <span className="text-[10px] font-mono uppercase" style={{ color: isSelected ? NEON_LIME : 'gray' }}>
                                                    {tier.security}
                                                </span>
                                            </div>
                                        </div>
                                        {isSelected && <Check className="w-5 h-5" style={{ color: NEON_CYAN }} />}
                                    </button>
                                );
                            })}

                            <div className="flex gap-3 mt-8">
                                <ArcadeButton
                                    onClick={() => setStep(1)}
                                    variant="cyan"
                                    className="flex-1"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> BACK
                                </ArcadeButton>
                                <ArcadeButton
                                    onClick={() => setStep(3)}
                                    variant="cyan"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    PROCEED <ArrowRight className="w-4 h-4" />
                                </ArcadeButton>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Options */}
                    {step === 3 && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-bold font-mono text-gray-400 uppercase" style={{ color: NEON_CYAN }}>
                                    {'>'} CANDIDATE_ENTITIES
                                </label>
                                <button
                                    onClick={addOption}
                                    disabled={options.length >= 10}
                                    className="flex items-center gap-2 px-3 py-1 border hover:bg-white/5 transition-colors text-xs font-mono uppercase"
                                    style={{ borderColor: NEON_LIME, color: NEON_LIME }}
                                >
                                    <Plus className="w-3 h-3" /> ADD_ENTITY
                                </button>
                            </div>

                            <div className="space-y-4">
                                {options.map((option, index) => (
                                    <div key={index} className="p-4 border bg-black/40 relative group"
                                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                        <div className="absolute top-0 left-0 px-2 py-0.5 text-[10px] font-mono bg-white/10 text-gray-400">
                                            ENTITY_0{index + 1}
                                        </div>

                                        <div className="flex items-start gap-3 mt-3">
                                            <div className="w-6 h-6 flex items-center justify-center border-l-2 border-b-2" style={{ borderColor: NEON_CYAN }}>
                                                <span className="text-xs font-mono text-gray-500">{index + 1}</span>
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                <input
                                                    type="text"
                                                    value={option.title}
                                                    onChange={(e) => updateOption(index, 'title', e.target.value)}
                                                    placeholder={`CANDIDATE_NAME_0${index + 1}`}
                                                    className="w-full bg-transparent border-b p-2 text-white font-mono focus:outline-none transition-all placeholder-gray-700 text-sm uppercase"
                                                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                                    onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                />
                                                <input
                                                    type="text"
                                                    value={option.description}
                                                    onChange={(e) => updateOption(index, 'description', e.target.value)}
                                                    placeholder="QUALIFICATIONS / BRIEF..."
                                                    className="w-full bg-transparent border-b p-2 text-white font-mono focus:outline-none transition-all placeholder-gray-700 text-xs"
                                                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                                    onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                />
                                                <input
                                                    type="text"
                                                    value={option.imageUrl}
                                                    onChange={(e) => updateOption(index, 'imageUrl', e.target.value)}
                                                    placeholder="IMAGE_SOURCE_URL..."
                                                    className="w-full bg-transparent border-b p-2 font-mono focus:outline-none transition-all placeholder-gray-700 text-xs"
                                                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: NEON_CYAN }}
                                                    onFocus={(e) => e.target.style.borderColor = NEON_CYAN}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                />
                                            </div>

                                            {options.length > 2 && (
                                                <button
                                                    onClick={() => removeOption(index)}
                                                    className="p-2 hover:bg-red-500/10 transition-colors group-hover:opacity-100 opacity-50"
                                                >
                                                    <X className="w-4 h-4" style={{ color: NEON_MAGENTA }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border bg-blue-900/10" style={{ borderColor: `${NEON_CYAN}40` }}>
                                <p className="text-xs font-mono" style={{ color: NEON_CYAN }}>
                                    {'>'} SYSTEM_TIP: MAXIMUM_CAPACITY_10_ENTITIES. SINGLE_SELECTION_VECTOR.
                                </p>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <ArcadeButton
                                    onClick={() => setStep(2)}
                                    variant="cyan"
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> BACK
                                </ArcadeButton>
                                <ArcadeButton
                                    onClick={handleSubmit}
                                    disabled={loading || options.filter(o => o.title.trim()).length < 2}
                                    variant="lime"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'black', borderTopColor: 'transparent' }} />
                                            INITIALIZING...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            LAUNCH_CHAMBER
                                        </>
                                    )}
                                </ArcadeButton>
                            </div>
                        </div>
                    )}
                </div>
            </CyberCard>
        </div>
    );
}
