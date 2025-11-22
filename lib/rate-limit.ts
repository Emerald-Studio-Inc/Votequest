type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const rateLimitStore: RateLimitStore = new Map();

export function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > windowMs) {
        record.count = 0;
        record.lastReset = now;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    rateLimitStore.set(ip, record);
    return true;
}

// Cleanup old entries periodically to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now - value.lastReset > 60000) { // 1 minute
            rateLimitStore.delete(key);
        }
    }
}, 60000);
