import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const { data: organization, error } = await supabaseAdmin
            .from('organizations')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ organization });

    } catch (error: any) {
        console.error('[API] Error fetching organization:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
