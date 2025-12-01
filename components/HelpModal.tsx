import { useState } from 'react';
import { HelpCircle, X, Vote, FileText, Zap, Trophy, Shield, ChevronRight } from 'lucide-react';

interface HelpModalProps {
    onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
    const [activeSection, setActiveSection] = useState<string>('getting-started');

    const sections = {
        'getting-started': {
            title: 'Getting Started',
            icon: HelpCircle,
            content: [
                { label: 'Connect Wallet', text: 'Click "Connect Wallet" and choose MetaMask' },
                { label: 'View Dashboard', text: 'See active proposals and your stats' },
                { label: 'Start Voting', text: 'Click any proposal to view details and vote' }
            ]
        },
        'voting': {
            title: 'How to Vote',
            icon: Vote,
            content: [
                { label: 'Choose Proposal', text: 'Browse active proposals on dashboard' },
                { label: 'Read Details', text: 'Click to see full description and options' },
                { label: 'Select Option', text: 'Pick your choice from available options' },
                { label: 'Complete CAPTCHA', text: 'Security check to prevent bots' },
                { label: 'Confirm Vote', text: 'Transaction in wallet (testnet, no fees)' },
                { label: 'Get Receipt', text: 'Earn coins + cryptographic proof' }
            ]
        },
        'receipts': {
            title: 'Understanding Receipts',
            icon: FileText,
            content: [
                { label: 'What Are They?', text: 'SHA-256 cryptographic proof of your actions' },
                { label: 'Why Important?', text: 'Permanent, unforgeable proof of participation' },
                { label: 'View Yours', text: 'Settings → View My Receipts' },
                { label: 'Export', text: 'Download as JSON or CSV anytime' },
                { label: 'Verify', text: 'Anyone can verify a receipt hash publicly' }
            ]
        },
        'coins': {
            title: 'Coin System',
            icon: Zap,
            content: [
                { label: 'Earn Coins', text: 'Vote (+10 VQC), Create Proposal (+50 VQC)' },
                { label: 'What They Do', text: 'Show contribution level, leaderboard rank' },
                { label: 'Receipts', text: 'Each coin has a cryptographic receipt' },
                { label: 'Level Up', text: 'Earn XP with coins to increase voting power' }
            ]
        },
        'security': {
            title: 'Security & Privacy',
            icon: Shield,
            content: [
                { label: 'CAPTCHA', text: 'Required on all votes to prevent bots' },
                { label: 'Wallet Safety', text: 'Never share your private key' },
                { label: 'Transparent', text: 'All votes are public (blockchain)' },
                { label: 'Receipts', text: 'Cryptographically verified, tamper-proof' }
            ]
        }
    };

    const currentSection = sections[activeSection as keyof typeof sections];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center px-6 animate-fade-in">
            <div className="card-elevated max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Quick Help</h2>
                            <p className="text-sm text-mono-60">Learn how to use VoteQuest</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-white/10 p-4 space-y-2 overflow-y-auto">
                        {Object.entries(sections).map(([key, section]) => {
                            const Icon = section.icon;
                            const isActive = activeSection === key;

                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveSection(key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-white text-black'
                                            : 'bg-white/5 text-mono-70 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium flex-1 text-left">{section.title}</span>
                                    {isActive && <ChevronRight className="w-4 h-4" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-6">{currentSection.title}</h3>
                        <div className="space-y-4">
                            {currentSection.content.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-sm font-bold text-white">{idx + 1}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                                        <p className="text-sm text-mono-60">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tips for current section */}
                        {activeSection === 'voting' && (
                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <p className="text-sm text-blue-400 font-medium mb-2">💡 Pro Tip</p>
                                <p className="text-sm text-mono-70">
                                    Read the full proposal description before voting. Your vote is permanent and recorded on the blockchain!
                                </p>
                            </div>
                        )}

                        {activeSection === 'receipts' && (
                            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <p className="text-sm text-green-400 font-medium mb-2">✨ Did You Know?</p>
                                <p className="text-sm text-mono-70">
                                    You can verify any receipt hash publicly at the verification page. Share your proof with anyone!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-mono-60">
                            Need more help? Check the full guide in Settings
                        </p>
                        <button onClick={onClose} className="btn btn-primary">
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
