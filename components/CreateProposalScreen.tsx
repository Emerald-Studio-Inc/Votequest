import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Calendar, ArrowLeft } from 'lucide-react';
import Tooltip from './Tooltip';

interface CreateProposalScreenProps {
    onBack: () => void;
    onSubmit: (data: any) => Promise<void>;
    loading: boolean;
}

const CreateProposalScreen: React.FC<CreateProposalScreenProps> = ({
    onBack,
    onSubmit,
    loading
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [options, setOptions] = useState([{ title: '', description: '' }, { title: '', description: '' }]);

    const handleAddOption = () => {
        setOptions([...options, { title: '', description: '' }]);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleOptionChange = (index: number, field: 'title' | 'description', value: string) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !endDate || options.some(o => !o.title)) return;

        await onSubmit({
            title,
            description,
            end_date: new Date(endDate).toISOString(),
            options
        });
    };

    return (
        <div className="min-h-screen pb-8 animate-fade-in">
            {/* Header */}
            <div className="relative z-10 pt-8 pb-6 px-6">
                <Tooltip content="Return to dashboard" position="right">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group animate-slide-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
                        <span className="text-xs font-light tracking-wide">Back to Dashboard</span>
                    </button>
                </Tooltip>

                <h1 className="text-3xl font-light text-white mb-2 tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>Create Proposal</h1>
                <p className="text-zinc-500 text-sm font-light animate-slide-up" style={{ animationDelay: '0.3s' }}>Submit a new governance proposal for community voting</p>
            </div>

            <div className="relative z-10 px-6">
                <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
                    {/* Basic Info */}
                    <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <div className="glass rounded-2xl p-6 space-y-6">
                            <div>
                                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Implement Staking Rewards"
                                    className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/10 transition-colors font-light"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your proposal in detail..."
                                    className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/10 transition-colors min-h-[150px] font-light leading-relaxed"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">End Date</label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-white/10 transition-colors pl-12 font-light"
                                        required
                                    />
                                    <Calendar className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <label className="text-zinc-400 text-xs uppercase tracking-wider">Voting Options</label>
                            <Tooltip content="Add another option" position="left">
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="text-white text-xs hover:text-zinc-300 flex items-center gap-1 transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Option
                                </button>
                            </Tooltip>
                        </div>

                        <div className="space-y-3">
                            {options.map((option, idx) => (
                                <div key={idx} className="glass rounded-xl p-4 relative group transition-all hover:bg-white/5 animate-scale-in" style={{ animationDelay: `${0.6 + (idx * 0.1)}s` }}>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                value={option.title}
                                                onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                                                placeholder={`Option ${idx + 1} Title`}
                                                className="w-full bg-transparent border-b border-white/5 p-2 text-white text-sm focus:border-white/20 focus:outline-none transition-colors font-light"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={option.description}
                                                onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                                                placeholder="Description (optional)"
                                                className="w-full bg-transparent border-none p-2 text-zinc-400 text-xs focus:outline-none font-light"
                                            />
                                        </div>
                                        {options.length > 2 && (
                                            <Tooltip content="Remove option" position="left">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOption(idx)}
                                                    className="text-zinc-600 hover:text-red-500 transition-colors self-start pt-2 opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white hover:bg-zinc-200 text-black py-4 rounded-xl font-light tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none animate-slide-up"
                        style={{ animationDelay: '0.8s' }}
                    >
                        {loading ? 'Creating Proposal...' : 'Submit Proposal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProposalScreen;
