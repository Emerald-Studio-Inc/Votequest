import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Share2, Mail, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface ShareRoomInviteProps {
    roomId: string;
    roomTitle: string;
}

export default function ShareRoomInvite({ roomId, roomTitle }: ShareRoomInviteProps) {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const voteUrl = `${window.location.origin}/vote/${roomId}`;

    useEffect(() => {
        if (showQR && canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, voteUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#F4D58D', // Gold color
                    light: '#000000'
                }
            });
        }
    }, [showQR, voteUrl]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(voteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent(`Vote: ${roomTitle}`);
        const body = encodeURIComponent(
            `You've been invited to vote!\n\n${roomTitle}\n\nCast your vote here:\n${voteUrl}\n\nPowered by VoteQuest`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const downloadQR = () => {
        if (canvasRef.current) {
            const url = canvasRef.current.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `vote-qr-${roomId}.png`;
            a.click();
        }
    };

    return (
        <div className="card-gold p-6 space-y-4 gold-glow">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center gold-glow">
                    <Share2 className="w-5 h-5 gold-text" />
                </div>
                <div>
                    <h3 className="font-bold">Share Voting Link</h3>
                    <p className="text-sm text-mono-60">Send this link to eligible voters</p>
                </div>
            </div>

            {/* URL Display */}
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
                <input
                    type="text"
                    value={voteUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    onClick={(e) => e.currentTarget.select()}
                />
                <button
                    onClick={copyToClipboard}
                    className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 text-green-400" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={shareViaEmail}
                    className="btn-gold btn-sm flex items-center justify-center gap-2"
                >
                    <Mail className="w-4 h-4" />
                    Email
                </button>

                <button
                    onClick={() => setShowQR(!showQR)}
                    className="btn btn-secondary btn-sm flex items-center justify-center gap-2"
                >
                    <QrCode className="w-4 h-4" />
                    QR Code
                </button>

                <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote now: ${roomTitle}`)}&url=${encodeURIComponent(voteUrl)}`, '_blank')}
                    className="btn btn-secondary btn-sm flex items-center justify-center gap-2"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
                    <h4 className="font-bold mb-4">Scan to Vote</h4>
                    <div className="flex justify-center mb-4">
                        <canvas ref={canvasRef} className="rounded-lg" />
                    </div>
                    <button
                        onClick={downloadQR}
                        className="btn btn-secondary btn-sm"
                    >
                        Download QR Code
                    </button>
                </div>
            )}

            <p className="text-xs text-mono-50 text-center">
                💡 Voters will verify their identity based on your tier settings
            </p>
        </div>
    );
}
