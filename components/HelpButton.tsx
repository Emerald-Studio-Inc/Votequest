import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';

const NEON_CYAN = '#00F0FF';

export default function HelpButton() {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowHelp(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-black border-2 flex items-center justify-center transition-all hover:scale-110 group overflow-hidden"
                style={{
                    borderColor: NEON_CYAN,
                    boxShadow: `0 0 20px ${NEON_CYAN}40`
                }}
                title="Help"
            >
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: NEON_CYAN }}></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: NEON_CYAN }}></div>

                <HelpCircle className="w-6 h-6 animate-pulse" style={{ color: NEON_CYAN }} />
            </button>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </>
    );
}
