'use client';

import { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ArcadeButton from './ArcadeButton';
import CyberCard from './CyberCard';
import { sfx } from '@/lib/sfx';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctIndex: number;
}

const MOCK_EXAM: Question[] = [
    {
        id: 1,
        text: "What is the primary mechanism for preventing Sybil attacks in this DAO?",
        options: ["Proof of Work", "Quadratic Voting & Identity", "Captchas Only", "None"],
        correctIndex: 1
    },
    {
        id: 2,
        text: "If the Treasury allocation fails, what is the fallback protocol?",
        options: ["System Halt", "Manual Override", "Return to Sender", "Escrow Lock"],
        correctIndex: 3
    },
    {
        id: 3,
        text: "Does this proposal impact the inflation rate?",
        options: ["Yes, significantly", "No, it's neutral", "Only for VQC", "Unknown"],
        correctIndex: 0
    }
];

export default function EntranceExam({ onPass, onFail, onCancel }: { onPass: () => void, onFail: () => void, onCancel: () => void }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [failed, setFailed] = useState(false);

    const handleAnswer = (optionIndex: number) => {
        sfx.playClick();
        const correct = MOCK_EXAM[currentQuestion].correctIndex === optionIndex;

        if (!correct) {
            // Immediate Fail Mode (High Stakes!)
            sfx.playError(); // Assume I add this or fallback
            setFailed(true);
            return;
        }

        const newAnswers = [...answers, optionIndex];
        setAnswers(newAnswers);

        if (currentQuestion + 1 < MOCK_EXAM.length) {
            setTimeout(() => setCurrentQuestion(prev => prev + 1), 500);
        } else {
            // Passed all
            sfx.playSuccess();
            onPass();
        }
    };

    if (failed) {
        return (
            <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur flex items-center justify-center p-6 animate-fade-in">
                <div className="bg-red-950/20 border-2 border-red-500 p-8 max-w-lg w-full text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,0,0.1)_10px,rgba(255,0,0,0.1)_20px)]" />

                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl font-bold text-red-500 mb-2 glitch-text">ACCESS DENIED</h2>
                    <p className="text-red-400 font-mono mb-8">COMPETENCY_CHECK_FAILED. STUDY_THE_MATERIAL.</p>

                    <div className="flex justify-center gap-4">
                        <ArcadeButton variant="magenta" onClick={onFail}>RETURN_TO_LOBBY</ArcadeButton>
                    </div>
                </div>
            </div>
        );
    }

    const question = MOCK_EXAM[currentQuestion];

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur flex items-center justify-center p-6 animate-fade-in">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-400" />
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-widest">VERIFICATION_PROTOCOL</h2>
                            <p className="text-xs text-blue-400 font-mono">QUESTION {currentQuestion + 1} / {MOCK_EXAM.length}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">DIFFICULTY</div>
                        <div className="text-red-500 font-bold animate-pulse">HARDCORE</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-900 mb-8 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,85,255,0.5)]"
                        style={{ width: `${((currentQuestion) / MOCK_EXAM.length) * 100}%` }}
                    />
                </div>

                {/* Question Card */}
                <CyberCard className="p-8 mb-6 border-blue-500/30">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                        {question.text}
                    </h3>

                    <div className="grid gap-4">
                        {question.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className="group relative p-4 text-left border border-white/10 hover:border-blue-400 bg-white/5 hover:bg-blue-950/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 flex items-center justify-center border border-white/20 group-hover:border-blue-400 rounded-sm font-mono text-gray-500 group-hover:text-blue-400">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="text-gray-300 group-hover:text-white font-mono">{opt}</span>
                                </div>
                                {/* Selection Indicator */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Shield className="w-4 h-4 text-blue-400" />
                                </div>
                            </button>
                        ))}
                    </div>
                </CyberCard>

                <div className="text-center">
                    <button onClick={onCancel} className="text-gray-600 hover:text-white text-xs uppercase tracking-widest transition-colors">
                        ABORT_VERIFICATION
                    </button>
                </div>
            </div>
        </div>
    );
}
