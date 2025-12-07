import { NextResponse } from 'next/server';
import { createOrganization } from '@/lib/institutional';

/**
 * Create a new organization
 * POST /api/organizations
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, domain, userId } = body;

        // Validation
        if (!name || !type || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: name, type, userId' },
                { status: 400 }
            );
        }

        const validTypes = ['school', 'company', 'nonprofit', 'government', 'other'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Invalid type. Must be one of: ' + validTypes.join(', ') },
                { status: 400 }
            );
        }

        // Create organization
        const { organization, error } = await createOrganization(
            name,
            type,
            userId,
            domain
        );

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        console.log('[API] Organization created:', organization?.id);

        return NextResponse.json({
            success: true,
            organization
        });

    } catch (error: any) {
        console.error('[API] Error creating organization:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Get user's organizations
 * GET /api/organizations?userId=xxx
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId parameter' },
                { status: 400 }
            );
        }

        const { getUserOrganizations } = await import('@/lib/institutional');
        const organizations = await getUserOrganizations(userId);

        return NextResponse.json({ organizations });

    } catch (error: any) {
        console.error('[API] Error fetching organizations:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
