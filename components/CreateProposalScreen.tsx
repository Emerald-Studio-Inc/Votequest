import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Calendar } from 'lucide-react';

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
        <div className="min-h-screen bg-zinc-950 pb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 border-b border-zinc-900">
                <div className="px-6 pt-16 pb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
                    >
                        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                        <span className="text-sm">Back</span>
                    </button>

                    <h1 className="text-3xl font-light text-white mb-2 tracking-tight">Create Proposal</h1>
                    <p className="text-zinc-500 text-sm">Submit a new governance proposal for community voting</p>
                </div>
            </div>

            <div className="relative z-10 px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-zinc-400 text-sm mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Implement Staking Rewards"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-zinc-400 text-sm mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your proposal in detail..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-blue-500 focus:outline-none transition-colors min-h-[150px]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-zinc-400 text-sm mb-2">End Date</label>
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-blue-500 focus:outline-none transition-colors pl-10"
                                    required
                                />
                                <Calendar className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-zinc-400 text-sm">Voting Options</label>
                            <button
                                type="button"
                                onClick={handleAddOption}
                                className="text-blue-500 text-sm hover:text-blue-400 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add Option
                            </button>
                        </div>

                        <div className="space-y-3">
                            {options.map((option, idx) => (
                                <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded p-4 relative group">
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                value={option.title}
                                                onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                                                placeholder={`Option ${idx + 1} Title`}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={option.description}
                                                onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                                                placeholder="Description (optional)"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-400 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(idx)}
                                                className="text-zinc-600 hover:text-red-500 transition-colors self-start pt-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
                        className="w-full bg-white hover:bg-zinc-100 text-black py-4 rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Proposal...' : 'Submit Proposal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProposalScreen;
