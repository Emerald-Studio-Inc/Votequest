import { useState } from 'react';
import { HelpCircle, X, Vote, FileText, Zap, Trophy, Shield, ChevronRight } from 'lucide-react';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface HelpModalProps {
    onClose: () => void;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

export default function HelpModal({ onClose }: HelpModalProps) {
    const [activeSection, setActiveSection] = useState<string>('getting-started');

    const sections = {
        'getting-started': {
            title: 'INIT_SEQUENCE',
            icon: HelpCircle,
            content: [
                { label: 'Connect Net-Link', text: 'Engage "Connect Wallet" -> Select MetaMask uplink.' },
                { label: 'Access Dashboard', text: 'Monitor active protocols and user statistics.' },
                { label: 'Initiate Voting', text: 'Select any proposal node to analyze and cast vote.' }
            ]
        },
        'voting': {
            title: 'VOTING_PROTOCOL',
            icon: Vote,
            content: [
                { label: 'Target Proposal', text: 'Identify target from active feed.' },
                { label: 'Analyze Data', text: 'Review full specs and potential outcomes.' },
                { label: 'Select Vector', text: 'Choose your preferred option.' },
                { label: 'Verify Humanity', text: 'Complete CAPTCHA verification sequence.' },
                { label: 'Sign Transaction', text: 'Authorize via wallet (Testnet, 0 fees).' },
                { label: 'Acquire Proof', text: 'Receive VQC + cryptographic receipt.' }
            ]
        },
        'receipts': {
            title: 'PROOF_OF_WORK',
            icon: FileText,
            content: [
                { label: 'Hash Data', text: 'SHA-256 cryptographic proof of actions.' },
                { label: 'Immutability', text: 'Permanent, unforgeable verification.' },
                { label: 'Access Log', text: 'Settings -> View My Receipts.' },
                { label: 'Data Export', text: 'Download JSON/CSV archives.' },
                { label: 'Public Verify', text: 'Any node can verify hash integrity.' }
            ]
        },
        'coins': {
            title: 'TOKEN_ECONOMICS',
            icon: Zap,
            content: [
                { label: 'Mining', text: 'Vote (+10 VQC), Create (+50 VQC).' },
                { label: 'Utility', text: 'Determine rank and leader status.' },
                { label: 'Ledger', text: 'All tokens backed by receipt hashes.' },
                { label: 'Level Up', text: 'Accrue XP to boost voting weight.' }
            ]
        },
        'security': {
            title: 'SECURITY_LAYER',
            icon: Shield,
            content: [
                { label: 'Bot Defense', text: 'CAPTCHA required on all entry vectors.' },
                { label: 'Key Safety', text: 'Never reveal private keys.' },
                { label: 'Transparency', text: 'All actions visible on chain.' },
                { label: 'Integrity', text: 'Cryptographically secured.' }
            ]
        }
    };

    const currentSection = sections[activeSection as keyof typeof sections];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 font-mono animate-fade-in">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <CyberCard
                className="w-full max-w-4xl h-[85vh] flex flex-col p-0 relative z-10"
                title="SYSTEM_MANUAL"
                cornerStyle="tech"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: `${NEON_CYAN}30` }}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border flex items-center justify-center bg-black" style={{ borderColor: NEON_CYAN }}>
                            <HelpCircle className="w-6 h-6 animate-pulse" style={{ color: NEON_CYAN }} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white uppercase tracking-wider glitch-text" data-text="OPERATOR_GUIDE">OPERATOR_GUIDE</h2>
                            <p className="text-xs text-gray-500 uppercase">V.2.0.4 MANUAL</p>
                        </div>
                    </div>
                    <ArcadeButton
                        onClick={onClose}
                        variant="magenta"
                        size="sm"
                        className="w-10 h-10 !p-0 flex items-center justify-center opacity-70 hover:opacity-100"
                    >
                        <X className="w-6 h-6" strokeWidth={2.5} />
                    </ArcadeButton>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 border-r p-4 space-y-2 overflow-y-auto bg-black/20" style={{ borderColor: `${NEON_CYAN}30` }}>
                        {Object.entries(sections).map(([key, section]) => {
                            const Icon = section.icon;
                            const isActive = activeSection === key;

                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveSection(key)}
                                    className="w-full flex items-center gap-3 px-4 py-3 border transition-all relative overflow-hidden group"
                                    style={{
                                        borderColor: isActive ? NEON_CYAN : 'transparent',
                                        backgroundColor: isActive ? `${NEON_CYAN}10` : 'transparent',
                                        color: isActive ? NEON_CYAN : 'gray'
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase flex-1 text-left">{section.title}</span>
                                    {isActive && <div className="w-1 h-full absolute left-0 top-0" style={{ backgroundColor: NEON_CYAN }} />}
                                    {isActive && <ChevronRight className="w-4 h-4 animate-pulse" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-8 overflow-y-auto bg-black/40 relative">
                        {/* Scanlines */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none opacity-50" />

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-8 border-b pb-2 inline-block uppercase tracking-widest" style={{ borderColor: NEON_CYAN }}>
                                // {currentSection.title}
                            </h3>

                            <div className="grid gap-6">
                                {currentSection.content.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-8 h-8 border flex items-center justify-center flex-shrink-0 mt-1 font-bold group-hover:scale-110 transition-transform"
                                            style={{ borderColor: NEON_CYAN, color: NEON_CYAN }}>
                                            0{idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
                                                {item.label}
                                            </p>
                                            <p className="text-xs text-gray-400 font-mono tracking-tight leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tips for current section */}
                            {activeSection === 'voting' && (
                                <div className="mt-8 p-4 border flex items-start gap-4" style={{ borderColor: NEON_MAGENTA, backgroundColor: `${NEON_MAGENTA}05` }}>
                                    <Zap className="w-5 h-5 flex-shrink-0" style={{ color: NEON_MAGENTA }} />
                                    <div>
                                        <p className="text-xs font-bold uppercase mb-1" style={{ color: NEON_MAGENTA }}>ADVISORY_NOTICE</p>
                                        <p className="text-xs text-gray-500">
                                            Blockchain writes are permanent. Verify vector coordinates before commitment.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'receipts' && (
                                <div className="mt-8 p-4 border flex items-start gap-4" style={{ borderColor: NEON_LIME, backgroundColor: `${NEON_LIME}05` }}>
                                    <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: NEON_LIME }} />
                                    <div>
                                        <p className="text-xs font-bold uppercase mb-1" style={{ color: NEON_LIME }}>SYSTEM_TIP</p>
                                        <p className="text-xs text-gray-500">
                                            Receipt hashes are public verifiers. Share proof without revealing private keys.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-black/60 flex items-center justify-between" style={{ borderColor: `${NEON_CYAN}30` }}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        {'>'} END_OF_FILE
                    </p>
                    <ArcadeButton onClick={onClose} variant="cyan" className="text-xs px-6 py-2">
                        ACKNOWLEDGE
                    </ArcadeButton>
                </div>
            </CyberCard>
        </div>
    );
}
