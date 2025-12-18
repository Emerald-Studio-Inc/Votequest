'use client';

import React, { useState } from 'react';
import { X, Link as LinkIcon, QrCode, Twitter, MessageCircle, Copy, Download, Check, Share2 } from 'lucide-react';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    proposalId: string;
    proposalTitle: string;
    userId: string;
}

const NEON_CYAN = '#0055FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    proposalId,
    proposalTitle,
    userId
}) => {
    const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'social'>('link');
    const [shareUrl, setShareUrl] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    // Generate share link when modal opens
    React.useEffect(() => {
        if (isOpen && !shareUrl) {
            generateShareLink();
        }
    }, [isOpen]);

    const generateShareLink = async () => {
        // Validate userId before making API call
        if (!userId || userId === '') {
            alert('PROTOCOL_ERROR: USER_ID_MISSING');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    proposalId,
                    shareType: activeTab
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShareUrl(data.shareUrl);
                setQrCodeUrl(data.qrCodeUrl);
                setReferralCode(data.referralCode);
            } else {
                alert(data.error || 'LINK_GENERATION_FAILED');
            }
        } catch (error) {
            console.error('Error generating share link:', error);
            alert('SYSTEM_FAILURE: LINK_GEN_ERROR');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `votequest-${referralCode}.png`;
        link.click();
    };

    const shareToTwitter = () => {
        const text = `Vote on: "${proposalTitle}" on VoteQuest!`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
    };

    const shareToDiscord = () => {
        // Discord doesn't have a direct share URL, so just copy
        copyToClipboard();
        alert('LINK_COPIED_TO_CLIPBOARD');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <CyberCard
                className="w-full max-w-lg relative z-10"
                title="DATA_TRANSMISSION"
                cornerStyle="tech"
            >
                <div>
                    {/* Header */}
                    <div className="p-6 border-b pb-4 flex items-center justify-between" style={{ borderColor: `${NEON_CYAN}30` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border flex items-center justify-center bg-black" style={{ borderColor: NEON_CYAN }}>
                                <Share2 className="w-5 h-5" style={{ color: NEON_CYAN }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider glitch-text" data-text="SHARE_PROPOSAL">SHARE_PROPOSAL</h2>
                                <p className="text-[10px] text-gray-500 uppercase">ENCRYPTED_CHANNEL</p>
                            </div>
                        </div>
                        <ArcadeButton
                            onClick={onClose}
                            variant="magenta"
                            size="sm"
                            className="w-8 h-8 !p-0 flex items-center justify-center opacity-70 hover:opacity-100"
                        >
                            <X className="w-5 h-5" strokeWidth={2.5} />
                        </ArcadeButton>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center p-2 border-b bg-black/40" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        {[
                            { value: 'link' as const, label: 'LINK_NODE', icon: LinkIcon },
                            { value: 'qr' as const, label: 'QR_MATRIX', icon: QrCode },
                            { value: 'social' as const, label: 'NETWORKS', icon: MessageCircle }
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase transition-all relative overflow-hidden"
                                style={{
                                    color: activeTab === tab.value ? NEON_CYAN : 'gray',
                                    borderBottom: activeTab === tab.value ? `2px solid ${NEON_CYAN}` : '2px solid transparent'
                                }}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                                {activeTab === tab.value && (
                                    <div className="absolute inset-0 bg-cyan-400/5 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6 min-h-[300px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: NEON_CYAN, borderTopColor: 'transparent' }} />
                                <span className="text-xs text-gray-400 animate-pulse">GENERATING_SECURE_LINK...</span>
                            </div>
                        ) : (
                            <>
                                {/* Link Tab */}
                                {activeTab === 'link' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="p-4 border bg-black/40" style={{ borderColor: NEON_LIME }}>
                                            <p className="text-xs text-gray-400 uppercase mb-1">INCENTIVE_PROTOCOL_ACTIVE</p>
                                            <p className="text-sm font-mono text-white">
                                                Share link to earn <span style={{ color: NEON_LIME, fontWeight: 'bold' }}>5 VQC</span> per vote.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500 uppercase font-mono">SECURE_URL</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-black/50 border px-3 py-3 text-sm font-mono text-gray-300 truncate"
                                                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                                    {shareUrl}
                                                </div>
                                                <ArcadeButton
                                                    onClick={copyToClipboard}
                                                    variant="blue"
                                                    className="w-auto px-6 h-[46px]" // Match input height roughly
                                                >
                                                    {copied ? (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            COPIED
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-4 h-4" />
                                                            COPY
                                                        </>
                                                    )}
                                                </ArcadeButton>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                                            <p className="text-[10px] text-gray-500 uppercase mb-2">REFERRAL_ID</p>
                                            <p className="text-2xl font-bold font-mono tracking-widest" style={{ color: NEON_CYAN }}>{referralCode}</p>
                                        </div>
                                    </div>
                                )}

                                {/* QR Code Tab */}
                                {activeTab === 'qr' && (
                                    <div className="space-y-6 animate-fade-in flex flex-col items-center">
                                        <p className="text-xs text-gray-400 font-mono text-center uppercase">
                                            SCAN_MATRIX_FOR_ACCESS
                                        </p>

                                        <div className="p-4 bg-white rounded-none border-4 relative group" style={{ borderColor: NEON_CYAN }}>
                                            {/* Corner Accents for QR */}
                                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-black" />
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-black" />
                                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-black" />
                                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-black" />

                                            <img
                                                src={qrCodeUrl}
                                                alt="QR Code"
                                                className="w-48 h-48 mix-blend-multiply"
                                            />

                                            {/* Scanline overlay */}
                                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none" />
                                        </div>

                                        <ArcadeButton
                                            onClick={downloadQR}
                                            variant="blue"
                                            className="w-full max-w-xs"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            DOWNLOAD_MATRIX
                                        </ArcadeButton>
                                    </div>
                                )}

                                {/* Social Tab */}
                                {activeTab === 'social' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <p className="text-xs text-gray-400 font-mono text-center uppercase mb-4">
                                            SELECT_TRANSMISSION_NETWORK
                                        </p>

                                        <button
                                            onClick={shareToTwitter}
                                            className="w-full flex items-center gap-3 p-4 border bg-black/40 hover:bg-[#1DA1F2]/10 transition-all group"
                                            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center bg-[#1DA1F2]/20 rounded-sm">
                                                <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <span className="block text-sm font-bold text-white group-hover:text-[#1DA1F2] transition-colors uppercase">Twitter / X</span>
                                                <span className="text-[10px] text-gray-500 font-mono">PUBLIC_BROADCAST</span>
                                            </div>
                                            <Share2 className="w-4 h-4 text-gray-600 group-hover:text-[#1DA1F2]" />
                                        </button>

                                        <button
                                            onClick={shareToDiscord}
                                            className="w-full flex items-center gap-3 p-4 border bg-black/40 hover:bg-[#5865F2]/10 transition-all group"
                                            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center bg-[#5865F2]/20 rounded-sm">
                                                <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <span className="block text-sm font-bold text-white group-hover:text-[#5865F2] transition-colors uppercase">Discord</span>
                                                <span className="text-[10px] text-gray-500 font-mono">COMMUNITY_CHANNEL</span>
                                            </div>
                                            <Share2 className="w-4 h-4 text-gray-600 group-hover:text-[#5865F2]" />
                                        </button>

                                        <div className="h-px bg-white/10 my-4" />

                                        <ArcadeButton
                                            onClick={copyToClipboard}
                                            variant="blue"
                                            className="w-full"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            COPY_MANUAL_LINK
                                        </ArcadeButton>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </CyberCard>
        </div>
    );
};

export default ShareModal;
