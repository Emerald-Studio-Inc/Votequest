import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Share2, Mail, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import CyberButton from './CyberButton';

interface ShareRoomInviteProps {
    roomId: string;
    roomTitle: string;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

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
                    dark: NEON_CYAN,
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
        <div className="p-6 space-y-4 border bg-black/40 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/50 transition-colors duration-500"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}>

            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />

            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 border flex items-center justify-center bg-black" style={{ borderColor: NEON_CYAN }}>
                    <Share2 className="w-5 h-5" style={{ color: NEON_CYAN }} />
                </div>
                <div>
                    <h3 className="font-bold text-white uppercase tracking-wider font-mono">SHARE_VOTING_LINK</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase">TRANSMIT_SECURE_AUTH_KEY</p>
                </div>
            </div>

            {/* URL Display */}
            <div className="flex items-center gap-2 bg-black border p-2 relative z-10" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <input
                    type="text"
                    value={voteUrl}
                    readOnly
                    className="flex-1 bg-transparent text-xs font-mono text-gray-300 focus:outline-none px-2"
                    onClick={(e) => e.currentTarget.select()}
                />
                <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 border bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
                    style={{ borderColor: copied ? NEON_LIME : 'rgba(255,255,255,0.1)' }}
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3" style={{ color: NEON_LIME }} />
                            <span className="text-[10px] uppercase font-bold" style={{ color: NEON_LIME }}>COPIED</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] uppercase font-bold text-gray-400">COPY</span>
                        </>
                    )}
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                <button
                    onClick={shareViaEmail}
                    className="p-3 border bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-mono uppercase text-gray-400">EMAIL</span>
                </button>

                <button
                    onClick={() => setShowQR(!showQR)}
                    className="p-3 border bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105"
                    style={{ borderColor: showQR ? NEON_CYAN : 'rgba(255,255,255,0.1)' }}
                >
                    <QrCode className="w-4 h-4" style={{ color: showQR ? NEON_CYAN : 'gray' }} />
                    <span className="text-[10px] font-mono uppercase" style={{ color: showQR ? NEON_CYAN : 'gray' }}>QR_CODE</span>
                </button>

                <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote now: ${roomTitle}`)}&url=${encodeURIComponent(voteUrl)}`, '_blank')}
                    className="p-3 border bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <Share2 className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-mono uppercase text-gray-400">SHARE</span>
                </button>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="border bg-black/90 p-6 text-center animate-fade-in relative z-10" style={{ borderColor: NEON_CYAN }}>
                    <h4 className="font-bold mb-4 text-xs font-mono uppercase text-white tracking-widest">SCAN_FOR_ACCESS</h4>
                    <div className="flex justify-center mb-4 p-2 bg-white inline-block">
                        <canvas ref={canvasRef} />
                    </div>
                    <CyberButton
                        onClick={downloadQR}
                        className="w-full !text-[10px]"
                    >
                        DOWNLOAD_QR_MATRIX
                    </CyberButton>
                </div>
            )}

            <p className="text-[10px] text-gray-600 font-mono text-center uppercase tracking-wider">
                {'>'} IDENTITY_VERIFICATION_REQUIRED
            </p>
        </div>
    );
}
