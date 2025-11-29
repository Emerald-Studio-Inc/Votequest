import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface VoteCaptchaProps {
    onVerify: (token: string) => void;
    onError?: () => void;
}

export default function VoteCaptcha({ onVerify, onError }: VoteCaptchaProps) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
        console.warn('Turnstile site key not configured');
        return null;
    }

    return (
        <div className="flex justify-center my-4">
            <Turnstile
                siteKey={siteKey}
                onSuccess={onVerify}
                onError={onError}
                options={{
                    theme: 'dark',
                    size: 'normal'
                }}
            />
        </div>
    );
}
