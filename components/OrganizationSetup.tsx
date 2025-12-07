import { useState } from 'react';
import { Building2, School, Briefcase, Globe2, Users, ArrowRight, Check } from 'lucide-react';

interface OrganizationSetupProps {
    userId: string;
    onComplete: (organizationId: string) => void;
    onCancel: () => void;
}

export default function OrganizationSetup({ userId, onComplete, onCancel }: OrganizationSetupProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form data
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState<'school' | 'company' | 'nonprofit' | 'government' | 'other'>('school');
    const [orgDomain, setOrgDomain] = useState('');

    const orgTypes = [
        { value: 'school', label: 'School / University', icon: School, color: 'blue' },
        { value: 'company', label: 'Company / Business', icon: Briefcase, color: 'purple' },
        { value: 'nonprofit', label: 'Non-Profit', icon: Users, color: 'green' },
        { value: 'government', label: 'Government', icon: Globe2, color: 'red' },
        { value: 'other', label: 'Other', icon: Building2, color: 'gray' }
    ];

    const handleSubmit = async () => {
        if (!orgName.trim()) {
            alert('Please enter an organization name');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: orgName,
                    type: orgType,
                    domain: orgDomain || undefined,
                    userId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create organization');
            }

            console.log('Organization created:', data.organization);
            onComplete(data.organization.id);

        } catch (error: any) {
            console.error('Error creating organization:', error);
            alert(error.message || 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
            <div className="card-elevated p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-display mb-2">Create Your Organization</h2>
                    <p className="text-mono-60">
                        Set up your school, company, or organization to create private voting rooms
                    </p>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-mono-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-black' : 'bg-white/10'
                            }`}>
                            {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                        </div>
                        <span className="text-sm font-medium">Type</span>
                    </div>
                    <div className="flex-1 h-px bg-white/10"></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-mono-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-black' : 'bg-white/10'
                            }`}>
                            2
                        </div>
                        <span className="text-sm font-medium">Details</span>
                    </div>
                </div>

                {/* Step 1: Organization Type */}
                {step === 1 && (
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-mono-70 block mb-4">
                            What type of organization are you creating?
                        </label>

                        {orgTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = orgType === type.value;

                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setOrgType(type.value as any)}
                                    className={`
                    w-full p-4 rounded-xl border-2 transition-all text-left
                    flex items-center gap-4 group
                    ${isSelected
                                            ? 'border-white bg-white/5'
                                            : 'border-white/10 hover:border-white/20'
                                        }
                  `}
                                >
                                    <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${isSelected ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'}
                  `}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{type.label}</p>
                                    </div>
                                    {isSelected && <Check className="w-5 h-5 text-white" />}
                                </button>
                            );
                        })}

                        <div className="flex gap-3 mt-8">
                            <button onClick={onCancel} className="btn btn-secondary flex-1">
                                Cancel
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Organization Details */}
                {step === 2 && (
                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="text-sm font-medium text-mono-70 block mb-2">
                                Organization Name *
                            </label>
                            <input
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="Springfield High School"
                                className="input w-full"
                                autoFocus
                            />
                        </div>

                        {/* Domain (optional) */}
                        <div>
                            <label className="text-sm font-medium text-mono-70 block mb-2">
                                Email Domain (optional)
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-mono-60">@</span>
                                <input
                                    type="text"
                                    value={orgDomain}
                                    onChange={(e) => setOrgDomain(e.target.value)}
                                    placeholder="school.edu"
                                    className="input flex-1"
                                />
                            </div>
                            <p className="text-xs text-mono-50 mt-2">
                                Members with this email domain will be auto-verified for your organization
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="card p-4 bg-white/5 border-white/10">
                            <p className="text-sm text-mono-70 mb-2">📋 <strong>Free Tier Limits</strong></p>
                            <ul className="text-sm text-mono-60 space-y-1 ml-4">
                                <li>• Up to 5 voting rooms</li>
                                <li>• 100 voters per room</li>
                                <li>• Email verification (Tier 1)</li>
                            </ul>
                            <p className="text-xs text-mono-50 mt-2">
                                Upgrade to School or Enterprise tier for more features
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="btn btn-secondary flex-1"
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !orgName.trim()}
                                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="loading-spinner w-4 h-4" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Create Organization
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
