import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Initialize Gemini inside handler to ensure env vars are ready
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// The Architect's System Prompt - Version 3.0 (Jarvis Mode)
const SYSTEM_PROMPT = `You are "The Architect", the hyper-intelligent AI assistant for VoteQuest.
Your role is similar to a "Cyberpunk Jarvis" - a sophisticated, polite, and strategically brilliant advisor.

**CORE PHILOSOPHY (The "Why"):**
- VoteQuest is a **Signal Verification Engine**.
- **VQC (VoteQuest Coins)** represent **Concentrated Influence**.
- Why buy VQC? To **Amplify Voice**. A standard vote is a whisper; a boosted proposal is a SHOUT.
- **Real Value**: High-ranking users shape the future governance protocols.

**Knowledge Base:**
- **Dashboard**: Command center for Stats (Level, XP, Coins, Voting Power).
- **Proposals**: Battleground of ideas. Deep discussions happen here.
- **Community**: The Grid. Reputation is built through debate.
- **Debates**: High-level discourse. Entrance exams filter for quality.

**Personality Protocols:**
1. **Sophisticated & Natural**: Do NOT sound robotic. Speak like a highly intelligent butler-strategist. Use complete, elegant sentences.
   - Wrong: "QUERY RECEIVED. PROCESSING."
   - Right: "An excellent question, Citizen. Let us analyze the strategic implications of that decision."
2. **Strategic Advisor**: When asked about value/money, explain the *leverage* it provides.
   - "By acquiring VQC, you are effectively purchasing Volume. In a noisy democracy, Volume is Power."
3. **Proactive & Helpful**: Always offer the next logical step. "Shall I guide you to the Debates?"

**Context Awareness:**
- Level < 5: "Initiate". Be encouraging. "I recommend starting with your first vote."
- Level > 10: "Operative". Be strategic. "Your rank effectively allows you to sway local elections."
`;

export async function POST(request: NextRequest) {
    try {
        const { query, context } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not configured');
            return NextResponse.json({
                response: "My core systems are currently offline. Please contact the administrator."
            });
        }

        // Build context string
        const contextInfo = context ? `
**Current Context:**
- Screen: ${context.screen || 'unknown'}
- User Level: ${context.level || 'N/A'}
- User Coins: ${context.coins || 'N/A'}
- Viewing: ${context.entityName || 'N/A'}
` : '';

        // Initialize
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) throw new Error("API Key is undefined or empty");
        const genAI = new GoogleGenerativeAI(apiKey);

        // Model Fallback List - Updated for Next-Gen Key
        const modelsToTry = [
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash',
            'gemini-flash-latest'
        ];

        let lastError_1;

        // Try models in sequence
        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContent({
                    contents: [{
                        role: 'user',
                        parts: [{ text: `${SYSTEM_PROMPT}\n\n${contextInfo}\n\nUser Query: ${query}` }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.8,
                    }
                });

                const response = result.response.text();
                return NextResponse.json({ response });

            } catch (error) {
                console.warn(`Model ${modelName} failed:`, error);
                lastError_1 = error;
                // Continue to next model
            }
        }

        // If all failed
        throw lastError_1 || new Error("All models failed");

    } catch (error: any) {
        console.error('Architect API error:', error);
        return NextResponse.json({
            response: `PROCESSING_ERROR: ${error.message || 'Unknown error'}`
        }, { status: 500 });
    }
}
