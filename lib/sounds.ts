// Minimal Base64 sounds to avoid external dependencies for now
// These are short, synthetic sci-fi sounds
export const SOUNDS = {
    HOVER: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=", // Placeholder - real implementation needs real assets or synth
    CLICK: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
    SUCCESS: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
};

// In a real app we would use mp3 files in public/desc
// For this agent session, I will use a Web Audio API synth to generate sounds on the fly
// to ensure they work without downloading files.
