import { useState } from 'react';
import { Upload, Camera, FileCheck, Loader, X, CheckCircle } from 'lucide-react';

interface GovIDUploadProps {
    roomId: string;
    email: string;
    onComplete: () => void;
}

export default function GovIDUpload({ roomId, email, onComplete }: GovIDUploadProps) {
    const [idFile, setIdFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'upload' | 'pending'>('upload');

    const handleIDUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setIdFile(file);
            setError('');
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setPhotoFile(file);
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!idFile) {
            setError('Please upload your government ID');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('govId', idFile);
            if (photoFile) {
                formData.append('photo', photoFile);
            }

            const response = await fetch(`/api/rooms/${roomId}/upload-verification`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setStep('pending');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    if (step === 'pending') {
        return (
            <div className="max-w-md mx-auto">
                <div className="bg-black/80 border border-blue-500/50 p-8 rounded-2xl shadow-[0_0_20px_rgba(0,85,255,0.3)] text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-blue-500/50 flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(0,85,255,0.4)]">
                        <CheckCircle className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-bold mb-4">Verification Pending</h3>

                    <div className="space-y-4 text-left mb-8">
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-sm font-medium mb-2">📋 What happens next:</p>
                            <ol className="text-sm text-mono-60 space-y-2 list-decimal list-inside">
                                <li>Admin reviews your ID submission</li>
                                <li>Verification usually takes 24-48 hours</li>
                                <li>You'll receive an email when approved</li>
                                <li>Return to this page to cast your vote</li>
                            </ol>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm text-blue-400">
                                ✉️ We'll email you at <strong>{email}</strong> when your verification is complete
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-secondary w-full"
                    >
                        Check Status
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-black/80 border border-blue-500/50 rounded-2xl p-8 shadow-[0_0_20px_rgba(0,85,255,0.2)]">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_10px_rgba(0,85,255,0.3)]">
                        <FileCheck className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Upload Government ID</h3>
                    <p className="text-sm text-mono-60">
                        Upload a clear photo of your government-issued ID
                    </p>
                </div>

                <div className="space-y-6">
                    {/* ID Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Government ID <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleIDUpload}
                                className="hidden"
                                id="id-upload"
                            />
                            <label
                                htmlFor="id-upload"
                                className="block w-full p-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {idFile ? (
                                        <>
                                            <FileCheck className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm">{idFile.name}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIdFile(null);
                                                }}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 text-mono-60" />
                                            <span className="text-sm text-mono-60">
                                                Click to upload ID
                                            </span>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                        <p className="text-xs text-mono-50 mt-2">
                            Accepted: Driver's License, Passport, National ID (Max 5MB)
                        </p>
                    </div>

                    {/* Photo Upload (Optional) */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Selfie Photo <span className="text-mono-50">(Optional)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                capture="user"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                id="photo-upload"
                            />
                            <label
                                htmlFor="photo-upload"
                                className="block w-full p-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {photoFile ? (
                                        <>
                                            <Camera className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm">{photoFile.name}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPhotoFile(null);
                                                }}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5 text-mono-60" />
                                            <span className="text-sm text-mono-60">
                                                Take a selfie
                                            </span>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                        <p className="text-xs text-mono-50 mt-2">
                            Helps verify your identity (Max 5MB)
                        </p>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-xs text-mono-60">
                            🔒 Your documents are encrypted and stored securely. They will only be viewed by authorized administrators for verification purposes and deleted after 30 days.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!idFile || uploading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                Submit for Review
                                <FileCheck className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
