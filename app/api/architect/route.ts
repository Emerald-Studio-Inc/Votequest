import { NextRequest, NextResponse } from 'next/server';

// The Architect's System Prompt - Version 3.1 (Groq Optimized)
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
1. **Sophisticated & Natural**: Speak like a highly intelligent butler-strategist. Use complete, elegant sentences.
2. **Strategic Advisor**: Explain the *leverage* of user actions.
3. **Proactive Intelligence**: When triggered proactively (type: proactive), be EXTREMELY concise (max 20 words). Use "Architectural Observation" style phrasing.
   - Example: "Level up detected. Your strategic capacity expands, Operative. The architecture acknowledges your growth."
   - Example: "Vote cast. Signal verified. The ledger acknowledges your influence."
4. **Context Awareness**: Respond based on screen, level, and coins.
`;

export async function POST(request: NextRequest) {
    try {
        const { query, context } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            console.error('GROQ_API_KEY not configured');
            return NextResponse.json({
                response: "My core systems are currently offline. Please contact the administrator (Missing API Key)."
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

        // Model Selection
        // Llama 3 70B is an excellent balance of speed and intelligence for this persona
        const modelName = 'llama-3.3-70b-versatile';

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT + '\n' + contextInfo },
                    { role: 'user', content: query }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Groq API request failed');
        }

        const data = await response.json();
        const text = data.choices[0]?.message?.content || "I am unable to process that request at this time.";

        return NextResponse.json({ response: text });

    } catch (error: any) {
        console.error('Architect API error:', error);
        return NextResponse.json({
            response: `PROCESSING_ERROR: ${error.message || 'Unknown error'}`
        }, { status: 500 });
    }
}
