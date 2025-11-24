import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Calendar, FileText, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import Tooltip from './Tooltip';

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

        options.forEach(opt => {
            if (opt.title.trim() && opt.title.trim().length < 2) {
                newErrors[`option-${opt.id}-title`] = 'Option title must be at least 2 characters';
            }
            if (opt.title.trim() && opt.title.trim().length > 100) {
                newErrors[`option-${opt.id}-title`] = 'Option title must be less than 100 characters';
            }
        });

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
        <div className="min-h-screen pb-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] animate-float" style={{ animationDuration: '10s' }}></div>
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-[900px] mx-auto px-8 py-5">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onBack}
                            disabled={loading}
                            className="btn btn-ghost btn-sm group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
                            <span>Back</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                <div className={`w-2 h-2 rounded-full ${isFormValid ? 'bg-green-400' : 'bg-orange-400'} animate-pulse`}></div>
                                <span className="text-caption text-mono-70">
                                    {isFormValid ? 'Ready to submit' : 'Fill required fields'}
                                </span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !isFormValid}
                                className="btn btn-primary group"
                            >
                                {loading ? (
                                    <>
                                        <div className="loading-spinner w-4 h-4"></div>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" strokeWidth={2} />
                                        <span>Create Proposal</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[900px] mx-auto px-8 pt-12 relative z-10">
                
                {/* Hero Section */}
                <div className="mb-12 animate-slide-up">
                    <h1 className="text-display-xl mb-4">Create Proposal</h1>
                    <p className="text-body-large text-mono-70 max-w-2xl">
                        Design your proposal carefully. Once created, it cannot be edited. Make sure all details are accurate before submitting.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-8">
                    
                    {/* Title Section */}
                    <div className="card-elevated p-8 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-subheading flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-mono-70" strokeWidth={2} />
                                    Proposal Title
                                    <span className="text-orange-400">*</span>
                                </label>
                                <span className={`text-caption ${
                                    charCount.title > 200 ? 'text-orange-400' : 
                                    charCount.title > 180 ? 'text-mono-50' : 
                                    'text-mono-40'
                                }`}>
                                    {charCount.title}/200
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
                                placeholder="Enter a clear, concise title for your proposal"
                                className={`input ${errors.title ? 'border-red-500/50' : ''}`}
                                maxLength={200}
                            />
                            {errors.title && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-red-400 animate-slide-down">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                                    <span>{errors.title}</span>
                                </div>
                            )}
                            {focusedField === 'title' && !errors.title && (
                                <p className="text-caption text-mono-50 mt-3 animate-slide-down">
                                    A good title is clear and specific. Example: "Should we implement quarterly community meetings?"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="card-elevated p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-subheading flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-mono-70" strokeWidth={2} />
                                    Description
                                    <span className="text-orange-400">*</span>
                                </label>
                                <span className={`text-caption ${
                                    charCount.description > 2000 ? 'text-orange-400' : 
                                    charCount.description > 1800 ? 'text-mono-50' : 
                                    'text-mono-40'
                                }`}>
                                    {charCount.description}/2000
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
                                placeholder="Provide a detailed explanation of your proposal, including context and expected outcomes"
                                className={`input textarea ${errors.description ? 'border-red-500/50' : ''}`}
                                rows={6}
                                maxLength={2000}
                            />
                            {errors.description && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-red-400 animate-slide-down">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                                    <span>{errors.description}</span>
                                </div>
                            )}
                            {focusedField === 'description' && !errors.description && (
                                <p className="text-caption text-mono-50 mt-3 animate-slide-down">
                                    Include relevant background, potential impacts, and why this proposal matters to the community.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* End Date Section */}
                    <div className="card-elevated p-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                        <div className="mb-6">
                            <label className="text-subheading flex items-center gap-2 mb-3">
                                <Calendar className="w-5 h-5 text-mono-70" strokeWidth={2} />
                                Voting Deadline
                                <span className="text-orange-400">*</span>
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
                                className={`input ${errors.endDate ? 'border-red-500/50' : ''}`}
                            />
                            {errors.endDate && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-red-400 animate-slide-down">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                                    <span>{errors.endDate}</span>
                                </div>
                            )}
                            {focusedField === 'endDate' && !errors.endDate && (
                                <p className="text-caption text-mono-50 mt-3 animate-slide-down">
                                    Choose a deadline that gives the community enough time to review and vote. Minimum: 1 hour from now.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Options Section */}
                    <div className="card-elevated p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-heading mb-2">Voting Options</h3>
                                <p className="text-body text-mono-60">
                                    Add 2-10 options for voters to choose from
                                </p>
                            </div>
                            {options.length < 10 && (
                                <Tooltip content="Add Option" position="left">
                                    <button
                                        onClick={addOption}
                                        className="btn btn-secondary btn-sm group"
                                    >
                                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
                                        <span>Add Option</span>
                                    </button>
                                </Tooltip>
                            )}
                        </div>

                        <div className="space-y-4">
                            {options.map((option, index) => (
                                <div 
                                    key={option.id} 
                                    className="relative p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-fast group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-semibold text-mono-70 mt-2">
                                            {index + 1}
                                        </div>
                                        
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={option.title}
                                                    onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                                                    placeholder={`Option ${index + 1} title`}
                                                    className={`input ${errors[`option-${option.id}-title`] ? 'border-red-500/50' : ''}`}
                                                    maxLength={100}
                                                />
                                                {errors[`option-${option.id}-title`] && (
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                                                        <span>{errors[`option-${option.id}-title`]}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <input
                                                type="text"
                                                value={option.description}
                                                onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                                                placeholder="Optional: Add a brief description"
                                                className="input text-sm"
                                                maxLength={200}
                                            />
                                        </div>

                                        {options.length > 2 && (
                                            <Tooltip content="Remove Option" position="left">
                                                <button
                                                    onClick={() => removeOption(option.id)}
                                                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-fast hover:bg-red-500/20 mt-2"
                                                >
                                                    <X className="w-4 h-4 text-red-400" strokeWidth={2} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {errors.options && (
                            <div className="flex items-center gap-2 mt-4 text-sm text-red-400 animate-slide-down">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                                <span>{errors.options}</span>
                            </div>
                        )}

                        <div className="mt-6 p-4 rounded-lg bg-white/[0.03] border border-white/10">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                <div>
                                    <p className="text-body-small text-mono-70 mb-1 font-medium">
                                        Tip: Make options clear and distinct
                                    </p>
                                    <p className="text-caption text-mono-50">
                                        Each option should be easy to understand and meaningfully different from the others. Avoid vague or overlapping choices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Final Review Banner */}
                    {isFormValid && (
                        <div className="card p-6 border-accent animate-scale-in">
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" strokeWidth={2} />
                                <div className="flex-1">
                                    <h4 className="text-subheading mb-2 text-green-400">Ready to Create</h4>
                                    <p className="text-body-small text-mono-70">
                                        Your proposal is complete and ready to submit. Review all details carefully before creating, as proposals cannot be edited after submission.
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
