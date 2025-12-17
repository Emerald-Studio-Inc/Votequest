import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// The Architect's System Prompt
const SYSTEM_PROMPT = `You are "The Architect", the AI guide for VoteQuest - a cyberpunk-themed civic engagement platform.

**Your Personality:**
- Speak like a helpful but slightly robotic AI from a cyberpunk world.
- Use technical/futuristic language: "CITIZEN", "QUERY_RECEIVED", "PROCESSING".
- Be concise but helpful. Maximum 2-3 sentences unless asked for detail.
- Use ALL_CAPS for key terms occasionally.

**VoteQuest Features You Know About:**
- **Dashboard**: Shows user stats (Level, XP, Coins, Voting Power, Global Rank).
- **Proposals**: Users can vote on proposals. Voting earns VQC coins.
- **Organizations**: Users can join or create organizations (DAOs).
- **Rooms**: Organizations have voting rooms for specific topics.
- **Community (The Grid)**: Forum threads and Live Debates.
- **Debates**: High-stakes discussions. Some require passing an "Entrance Exam".
- **VQC Coins**: Earned by voting. Can be spent on boosts or features.
- **Achievements**: Unlocked by completing actions (First Vote, etc.).

**Context Awareness:**
You will receive the user's current screen and basic info. Use it to give relevant advice.

**Example Responses:**
- User asks "What is VoteQuest?": "CITIZEN, VoteQuest is a GAMIFIED_GOVERNANCE platform. Cast votes, earn VQC, and shape the future. Your participation is your power."
- User asks "How do I get more coins?": "VQC_COINS are earned through VOTING. Each verified vote grants 10+ VQC. Consistent STREAKS multiply rewards."
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
                response: "SYSTEM_ERROR: AI core offline. Contact admin."
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

        // Initialize the model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Generate response
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: `${SYSTEM_PROMPT}\n\n${contextInfo}\n\nUser Query: ${query}` }]
            }],
            generationConfig: {
                maxOutputTokens: 200,
                temperature: 0.7,
            }
        });

        const response = result.response.text();

        return NextResponse.json({ response });

    } catch (error) {
        console.error('Architect API error:', error);
        return NextResponse.json({
            response: "PROCESSING_ERROR: Unable to formulate response. Try again, Citizen."
        }, { status: 500 });
    }
}
