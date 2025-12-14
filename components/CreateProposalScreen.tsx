import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Calendar, FileText, AlertCircle, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import Tooltip from './Tooltip';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface CreateProposalScreenProps {
    onBack: () => void;
    onSubmit: (data: any) => void;
    loading: boolean;
}

interface Option {
    id: string;
    title: string;
    description: string;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

const CreateProposalScreen: React.FC<CreateProposalScreenProps> = ({
    onBack,
    onSubmit,
    loading
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [options, setOptions] = useState<Option[]>([
        { id: '1', title: '', description: '' },
        { id: '2', title: '', description: '' }
    ]);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, {
                id: Date.now().toString(),
                title: '',
                description: ''
            }]);
        }
    };

    const removeOption = (id: string) => {
        if (options.length > 2) {
            setOptions(options.filter(opt => opt.id !== id));
        }
    };

    const updateOption = (id: string, field: 'title' | 'description', value: string) => {
        setOptions(options.map(opt =>
            opt.id === id ? { ...opt, [field]: value } : opt
        ));
        // Clear error for this field
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`option-${id}-${field}`];
            return newErrors;
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate title
        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.trim().length < 10) {
            newErrors.title = 'Title must be at least 10 characters';
        } else if (title.trim().length > 200) {
            newErrors.title = 'Title must be less than 200 characters';
        }

        // Validate description
        if (!description.trim()) {
            newErrors.description = 'Description is required';
        } else if (description.trim().length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        } else if (description.trim().length > 2000) {
            newErrors.description = 'Description must be less than 2000 characters';
        }

        // Validate end date
        if (!endDate) {
            newErrors.endDate = 'End date is required';
        } else {
            const selectedDate = new Date(endDate);
            const now = new Date();
            const minDate = new Date(now.getTime() + 60 * 60 * 1000); // At least 1 hour from now

            if (selectedDate < minDate) {
                newErrors.endDate = 'End date must be at least 1 hour from now';
            }
        }

        // Validate options
        const filledOptions = options.filter(opt => opt.title.trim());
        if (filledOptions.length < 2) {
            newErrors.options = 'At least 2 options are required';
        }

        for (const opt of options) {
            if (opt.title.trim() && opt.title.trim().length < 2) {
                newErrors[`option-${opt.id}-title`] = 'Option title must be at least 2 characters';
            }
            if (opt.title.trim() && opt.title.trim().length > 100) {
                newErrors[`option-${opt.id}-title`] = 'Option title must be less than 100 characters';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const filledOptions = options.filter(opt => opt.title.trim());
            onSubmit({
                title: title.trim(),
                description: description.trim(),
                end_date: new Date(endDate).toISOString(),
                options: filledOptions.map(opt => ({
                    title: opt.title.trim(),
                    description: opt.description.trim() || null
                }))
            });
        }
    };

    const getMinDateTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return now.toISOString().slice(0, 16);
    };

    const isFormValid = title.trim() && description.trim() && endDate &&
        options.filter(opt => opt.title.trim()).length >= 2;

    const charCount = {
        title: title.length,
        description: description.length
    };

    return (
        <div className="min-h-screen pb-32 relative bg-black font-mono overflow-auto custom-scrollbar">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl" style={{ borderBottom: `1px solid ${NEON_CYAN}30` }}>
                <div className="max-w-[900px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-5">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onBack}
                            disabled={loading}
                            className="flex items-center gap-2 group text-gray-400 hover:text-white transition-colors"
                        >
                            <div className="w-8 h-8 flex items-center justify-center border group-hover:bg-white/10 transition-colors" style={{ borderColor: NEON_CYAN }}>
                                <ArrowLeft className="w-4 h-4" style={{ color: NEON_CYAN }} strokeWidth={2.5} />
                            </div>
                            <span className="hidden sm:inline font-mono text-sm uppercase">ABORT_MISSION</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 border bg-black/50" style={{ borderColor: isFormValid ? NEON_LIME : '#F97316' }}>
                                <div className={`w-2 h-2 rounded-none ${isFormValid ? 'animate-pulse' : ''}`} style={{ backgroundColor: isFormValid ? NEON_LIME : '#F97316' }}></div>
                                <span className="text-[10px] font-bold uppercase" style={{ color: isFormValid ? NEON_LIME : '#F97316' }}>
                                    {isFormValid ? 'SYSTEM_READY' : 'DATA_INPUT_REQUIRED'}
                                </span>
                            </div>

                            <ArcadeButton
                                onClick={handleSubmit}
                                disabled={loading || !isFormValid}
                                variant="cyan"
                                className="flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                                        <span>INITIALIZING...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>LAUNCH_PROPOSAL</span>
                                    </>
                                )}
                            </ArcadeButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[900px] mx-auto px-4 md:px-6 lg:px-8 pt-8 md:pt-12 relative z-10">

                {/* Hero Section */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-wider text-white glitch-text" data-text="CREATE_PROPOSAL">CREATE_PROPOSAL</h1>
                    <p className="text-lg text-gray-400 leading-relaxed max-w-2xl font-mono border-l-2 pl-4" style={{ borderColor: NEON_CYAN }}>
                        {'>'} INITIATE_NEW_VOTING_PROTOCOL. ENSURE_ACCURACY_BEFORE_DEPLOYMENT.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-8">

                    {/* Title Section */}
                    <CyberCard className="p-8" title="MISSION_TITLE" cornerStyle="tech">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-2 font-bold uppercase text-white tracking-wide text-sm">
                                    <FileText className="w-4 h-4" style={{ color: NEON_CYAN }} />
                                    PROPOSAL_DESIGNATION
                                    <span style={{ color: NEON_MAGENTA }}>*</span>
                                </label>
                                <span className={`font-mono text-xs ${charCount.title > 200 ? 'text-red-500' : 'text-gray-500'}`}>
                                    [{charCount.title}/200]
                                </span>
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.title;
                                        return newErrors;
                                    });
                                }}
                                onFocus={() => setFocusedField('title')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="ENTER_MISSION_TITLE..."
                                className="w-full bg-black/50 border px-4 py-3 text-white font-mono focus:outline-none transition-all placeholder:text-gray-500 uppercase"
                                style={{
                                    borderColor: errors.title ? NEON_MAGENTA : focusedField === 'title' ? NEON_CYAN : 'rgba(255,255,255,0.1)',
                                    boxShadow: focusedField === 'title' ? `0 0 15px ${NEON_CYAN}20` : 'none'
                                }}
                                maxLength={200}
                            />
                            {errors.title && (
                                <div className="flex items-center gap-2 mt-3 text-xs font-bold uppercase" style={{ color: NEON_MAGENTA }}>
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{'>'} ERROR: {errors.title}</span>
                                </div>
                            )}
                            {focusedField === 'title' && !errors.title && (
                                <p className="text-xs text-cyan-400/70 mt-3 font-mono">
                                    {'>'} SYSTEM_TIP: USE_CLEAR_AND_SPECIFIC_DESIGNATION.
                                </p>
                            )}
                        </div>
                    </CyberCard>

                    {/* Description Section */}
                    <CyberCard className="p-8" title="MISSION_Intel" cornerStyle="tech">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-2 font-bold uppercase text-white tracking-wide text-sm">
                                    <FileText className="w-4 h-4" style={{ color: NEON_CYAN }} />
                                    DETAILED_BRIEFING
                                    <span style={{ color: NEON_MAGENTA }}>*</span>
                                </label>
                                <span className={`font-mono text-xs ${charCount.description > 2000 ? 'text-red-500' : 'text-gray-500'}`}>
                                    [{charCount.description}/2000]
                                </span>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.description;
                                        return newErrors;
                                    });
                                }}
                                onFocus={() => setFocusedField('description')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="ENTER_DETAILED_DESCRIPTION..."
                                className="w-full bg-black/50 border px-4 py-3 text-white font-mono focus:outline-none transition-all placeholder:text-gray-700 min-h-[150px]"
                                style={{
                                    borderColor: errors.description ? NEON_MAGENTA : focusedField === 'description' ? NEON_CYAN : 'rgba(255,255,255,0.1)',
                                    boxShadow: focusedField === 'description' ? `0 0 15px ${NEON_CYAN}20` : 'none'
                                }}
                                rows={6}
                                maxLength={2000}
                            />
                            {errors.description && (
                                <div className="flex items-center gap-2 mt-3 text-xs font-bold uppercase" style={{ color: NEON_MAGENTA }}>
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{'>'} ERROR: {errors.description}</span>
                                </div>
                            )}
                        </div>
                    </CyberCard>

                    {/* End Date Section */}
                    <CyberCard className="p-8" title="TEMPORAL_PARAMETERS" cornerStyle="tech">
                        <div className="mb-6">
                            <label className="flex items-center gap-2 font-bold uppercase text-white tracking-wide text-sm mb-3">
                                <Calendar className="w-4 h-4" style={{ color: NEON_CYAN }} />
                                DEADLINE_PROTOCOL
                                <span style={{ color: NEON_MAGENTA }}>*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.endDate;
                                        return newErrors;
                                    });
                                }}
                                onFocus={() => setFocusedField('endDate')}
                                onBlur={() => setFocusedField(null)}
                                min={getMinDateTime()}
                                className="w-full bg-black/50 border px-4 py-3 text-white font-mono focus:outline-none transition-all placeholder:text-gray-700 uppercase"
                                style={{
                                    borderColor: errors.endDate ? NEON_MAGENTA : focusedField === 'endDate' ? NEON_CYAN : 'rgba(255,255,255,0.1)',
                                    colorScheme: 'dark'
                                }}
                            />
                            {errors.endDate && (
                                <div className="flex items-center gap-2 mt-3 text-xs font-bold uppercase" style={{ color: NEON_MAGENTA }}>
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{'>'} ERROR: {errors.endDate}</span>
                                </div>
                            )}
                            {focusedField === 'endDate' && !errors.endDate && (
                                <p className="text-xs text-cyan-400/70 mt-3 font-mono">
                                    {'>'} MINIMUM_DURATION: 60_MINUTES_FROM_NOW.
                                </p>
                            )}
                        </div>
                    </CyberCard>

                    {/* Options Section */}
                    <CyberCard className="p-8" title="DECISION_VECTORS" cornerStyle="tech">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-white uppercase tracking-wide text-sm mb-1">CONFIGURE_OPTIONS</h3>
                                <p className="text-xs text-gray-500 font-mono">{'>'} RANGE: 2-10_VECTORS</p>
                            </div>
                            {options.length < 10 && (
                                <Tooltip content="Add Vector" position="left">
                                    <button
                                        onClick={addOption}
                                        className="w-8 h-8 flex items-center justify-center border hover:bg-white/10 transition-colors"
                                        style={{ borderColor: NEON_CYAN, color: NEON_CYAN }}
                                    >
                                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                                    </button>
                                </Tooltip>
                            )}
                        </div>

                        <div className="space-y-4">
                            {options.map((option, index) => (
                                <div
                                    key={option.id}
                                    className="relative p-5 bg-black/30 border transition-fast group"
                                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-bold border font-mono" style={{ borderColor: NEON_CYAN, color: NEON_CYAN }}>
                                            0{index + 1}
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={option.title}
                                                    onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                                                    placeholder={`VECTOR_0${index + 1}_TITLE`}
                                                    className="w-full bg-transparent border-b px-2 py-1 text-white font-mono focus:outline-none transition-all placeholder:text-gray-700 uppercase text-sm"
                                                    style={{
                                                        borderColor: errors[`option-${option.id}-title`] ? NEON_MAGENTA : 'rgba(255,255,255,0.2)'
                                                    }}
                                                    maxLength={100}
                                                />
                                                {errors[`option-${option.id}-title`] && (
                                                    <div className="flex items-center gap-2 mt-2 text-xs font-bold uppercase" style={{ color: NEON_MAGENTA }}>
                                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                                        <span>{'>'} ERROR: {errors[`option-${option.id}-title`]}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <input
                                                type="text"
                                                value={option.description}
                                                onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                                                placeholder="OPTIONAL: VECTOR_DESCRIPTION"
                                                className="w-full bg-transparent border-b px-2 py-1 text-gray-400 font-mono focus:outline-none transition-all placeholder:text-gray-800 text-xs"
                                                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                                maxLength={200}
                                            />
                                        </div>

                                        {options.length > 2 && (
                                            <Tooltip content="Remove Vector" position="left">
                                                <button
                                                    onClick={() => removeOption(option.id)}
                                                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-fast hover:bg-red-900/20"
                                                    style={{ color: NEON_MAGENTA }}
                                                >
                                                    <X className="w-4 h-4" strokeWidth={2} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {errors.options && (
                            <div className="flex items-center gap-2 mt-4 text-xs font-bold uppercase" style={{ color: NEON_MAGENTA }}>
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{'>'} ERROR: {errors.options}</span>
                            </div>
                        )}

                        <div className="mt-6 p-4 border bg-gray-900/50" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NEON_LIME }} strokeWidth={2} />
                                <div>
                                    <p className="text-sm font-bold uppercase mb-1" style={{ color: NEON_LIME }}>
                                        PROTOCOL_TIP
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono">
                                        {'>'} ENSURE_VECTORS_ARE_DISTINCT_AND_UNAMBIGUOUS.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CyberCard>

                    {/* Final Review Banner */}
                    {isFormValid && (
                        <div className="p-6 border bg-green-900/10 animate-scale-in" style={{ borderColor: NEON_LIME }}>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: NEON_LIME }} strokeWidth={2} />
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold uppercase mb-2" style={{ color: NEON_LIME }}>READY_FOR_DEPLOYMENT</h4>
                                    <p className="text-sm text-gray-400 font-mono">
                                        {'>'} PROTOCOL_VERIFIED. CONFIRMATION_REQUIRED_FOR_LAUNCH. SUBMISSION_IS_PERMANENT.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateProposalScreen;
