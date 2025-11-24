import { NextResponse } from 'next/server';
import { checkAndAwardAchievements } from '@/lib/achievements-server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 30, 60000)) { // 30 checks per minute per IP
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        const hasNew = await checkAndAwardAchievements(userId);

        return NextResponse.json({ success: true, hasNewAchievements: hasNew });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
