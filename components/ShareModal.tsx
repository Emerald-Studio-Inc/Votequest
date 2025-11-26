'use client';

import React, { useState } from 'react';
import { X, Link as LinkIcon, QrCode, Twitter, MessageCircle, Copy, Download, Check } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    proposalId: string;
    proposalTitle: string;
    userId: string;
}

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
                alert(data.error || 'Failed to generate share link');
            }
        } catch (error) {
            console.error('Error generating share link:', error);
            alert('Failed to generate share link');
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
        alert('Link copied! Paste it in Discord');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="glass-heavy rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg pointer-events-auto animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <h3 className="text-heading">Share Proposal</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-fast"
                        >
                            <X className="w-5 h-5" strokeWidth={2} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 p-4 border-b border-white/5">
                        {[
                            { value: 'link' as const, label: 'Link', icon: LinkIcon },
                            { value: 'qr' as const, label: 'QR Code', icon: QrCode },
                            { value: 'social' as const, label: 'Social', icon: MessageCircle }
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-fast ${activeTab === tab.value
                                        ? 'bg-white/10 text-white'
                                        : 'text-mono-60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" strokeWidth={2} />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Link Tab */}
                                {activeTab === 'link' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <p className="text-body-small text-mono-60">
                                            Share this link and earn <span className="text-yellow-500 font-semibold">5 VQC</span> when someone votes!
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={shareUrl}
                                                readOnly
                                                className="input flex-1"
                                            />
                                            <button
                                                onClick={copyToClipboard}
                                                className="btn btn-primary"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="w-4 h-4" strokeWidth={2.5} />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" strokeWidth={2} />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                            <p className="text-caption text-mono-50 uppercase mb-1">Referral Code</p>
                                            <p className="text-subheading font-mono">{referralCode}</p>
                                        </div>
                                    </div>
                                )}

                                {/* QR Code Tab */}
                                {activeTab === 'qr' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <p className="text-body-small text-mono-60 text-center">
                                            Scan this QR code to share in-person
                                        </p>

                                        <div className="flex justify-center p-6">
                                            <div className="p-4 bg-white rounded-xl">
                                                <img
                                                    src={qrCodeUrl}
                                                    alt="QR Code"
                                                    className="w-64 h-64"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={downloadQR}
                                            className="btn btn-primary w-full"
                                        >
                                            <Download className="w-4 h-4" strokeWidth={2} />
                                            Download QR Code
                                        </button>
                                    </div>
                                )}

                                {/* Social Tab */}
                                {activeTab === 'social' && (
                                    <div className="space-y-3 animate-fade-in">
                                        <p className="text-body-small text-mono-60 mb-4">
                                            Share on your favorite platform
                                        </p>

                                        <button
                                            onClick={shareToTwitter}
                                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 hover:bg-[#1DA1F2]/20 transition-fast group"
                                        >
                                            <Twitter className="w-5 h-5 text-[#1DA1F2]" strokeWidth={2} />
                                            <span className="text-sm font-medium group-hover:text-white transition-fast">Share on Twitter / X</span>
                                        </button>

                                        <button
                                            onClick={shareToDiscord}
                                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 hover:bg-[#5865F2]/20 transition-fast group"
                                        >
                                            <MessageCircle className="w-5 h-5 text-[#5865F2]" strokeWidth={2} />
                                            <span className="text-sm font-medium group-hover:text-white transition-fast">Share on Discord</span>
                                        </button>

                                        <button
                                            onClick={copyToClipboard}
                                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-fast group"
                                        >
                                            <Copy className="w-5 h-5 text-mono-60 group-hover:text-white" strokeWidth={2} />
                                            <span className="text-sm font-medium group-hover:text-white transition-fast">Copy Link</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShareModal;
