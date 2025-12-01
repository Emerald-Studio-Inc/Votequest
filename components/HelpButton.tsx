import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';

export default function HelpButton() {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowHelp(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white text-black shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
                title="Help"
            >
                <HelpCircle className="w-6 h-6" />
            </button>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </>
    );
}
