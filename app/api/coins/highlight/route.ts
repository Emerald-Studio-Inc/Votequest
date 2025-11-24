import { NextResponse } from 'next/server';
import { highlightProposal } from '@/lib/coin-spending';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 10, 60000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { userId, proposalId } = await request.json();

        if (!userId || !proposalId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await highlightProposal(userId, proposalId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
