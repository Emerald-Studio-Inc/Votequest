/**
 * Architect Lore & Interaction Library
 * 
 * Provides sophisticated, immersive dialogue for "The Architect" persona.
 * Dialogue is tailored to the user's progress level and current action.
 */

export interface ArchitectEvent {
    type: 'welcome' | 'vote_cast' | 'level_up' | 'low_coins' | 'debate_entry';
    userState: {
        level: number;
        coins: number;
        streak?: number;
    };
    context?: string;
}

const MESSAGES = {
    welcome: [
        "CITIZEN_RECOGNIZED. WELCOME TO VOTEQUEST. ACCESSING NAV_SYSTEM...",
        "WELCOME BACK, OPERATIVE. THE GRID HAS SHIFTED SINCE YOUR LAST LOG. ANALYZING LATEST PROPOSALS...",
        "GREETINGS, CITIZEN. THE COLLECTIVE VOICE REQUIRES YOUR INPUT. SHALL WE PROCEED?"
    ],
    vote_cast: [
        "YOUR VOICE HAS BEEN ETCHED INTO THE LEDGER. IMMUTABLE. VERIFIED.",
        "GOVERNANCE SIGNAL TRANSMITTED. COLLECTIVE INTELLIGENCE UPDATED.",
        "VOTE REGISTERED. THE ARCHITECTURE OF POWER SHIFTS SLIGHTLY IN YOUR FAVOR."
    ],
    level_up: [
        "STRATEGIC CAPACITY INCREASED. YOU ARE BECOMING A FORMIDABLE FORCE IN THE GRID.",
        "COGNITIVE LOAD HANDLING UPGRADED. YOUR INFLUENCE LEVEL HAS REACHED A NEW THRESHOLD.",
        "PRIME OPERATIVE STATUS NEARING. LEVEL UP SEQUENCE COMPLETE."
    ],
    low_coins: [
        "RESOURCE LEVELS ARE CRITICAL. HIGH-VOLUME INFLUENCE REQUIRES VQC ACQUISITION.",
        "VQC DEPLETED. YOUR VOICE IS CURRENTLY A WHISPER. CONSIDER REPLENISHING RESOURCES.",
        "CAPITAL RESERVES LOW. THE ARCHITECTURE FAVORS THE WELL-EQUIPPED."
    ],
    debate_entry: [
        "PRECISION IN DISCOURSE IS REQUIRED HERE. THE FILTER IS ABSOLUTE.",
        "ANALYZING RHETORICAL DENSITY... ENTERING HIGH-LEVEL ARENA. PREPARE YOUR LOGIC.",
        "THE DEBATE ARENA IS ACTIVE. ONLY THE MOST RIGOROUS ARGUMENTS SURVIVE."
    ]
};

/**
 * Gets an intelligent response from the API, falling back to static lore if needed.
 */
export const getArchitectResponse = async (event: ArchitectEvent): Promise<string> => {
    try {
        // Prepare query based on type
        let query = "";
        switch (event.type) {
            case 'welcome': query = "Identify yourself and welcome the user back to the Grid."; break;
            case 'vote_cast': query = "Acknowledge the user's successful vote and its impact on the ledger."; break;
            case 'level_up': query = `Recognize the user's advancement to Level ${event.userState.level}.`; break;
            case 'low_coins': query = "Warning: VQC reserves are critically low."; break;
            case 'debate_entry': query = "Observe the user entering the high-stakes Debate Arena."; break;
            default: query = "Observation required.";
        }

        const res = await fetch('/api/architect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `[PROACTIVE_TRIGGER]: ${query}`,
                context: {
                    type: 'proactive',
                    screen: event.context || 'dashboard',
                    level: event.userState.level,
                    coins: event.userState.coins
                }
            })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.response) return data.response;
        }
    } catch (error) {
        console.warn('[ARCHITECT] Dynamic response failed, falling back to static lore.', error);
    }

    // Static Fallback
    const category = MESSAGES[event.type];
    if (!category || category.length === 0) return "SIGNAL_LOST...";
    const index = Math.floor(Math.random() * category.length);
    return category[index];
};

/**
 * Higher-level logic for proactivity
 */
export const analyzeProactiveCommentary = (userState: { level: number, coins: number }): string | null => {
    if (userState.coins < 5) {
        return MESSAGES.low_coins[0];
    }
    return null;
};
