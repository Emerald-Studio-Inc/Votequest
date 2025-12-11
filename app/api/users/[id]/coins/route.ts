import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Await params to satisfy Next.js 15+ requirements if applicable, 
        // though standard Next.js 13/14 params are synchronous objects.
        // We'll treat it as a promise just in case or standard object.
        // But to be safe with the previously seen file pattern:
        const userId = params.id;

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('coins')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user coins:', error);
            // Return 0 on error to prevent UI crashes, but log it
            return NextResponse.json({ coins: 0 });
        }

        return NextResponse.json({ coins: user?.coins || 0 });

    } catch (error: any) {
        console.error('Error fetching coins:', error);
        return NextResponse.json({ coins: 0 }, { status: 500 });
    }
}
