import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Get all pending government ID verifications
 * GET /api/admin/pending-verifications
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        let query = supabaseAdmin
            .from('voter_eligibility')
            .select(`
        *,
        voting_rooms!inner(
          id,
          title
        )
      `)
            .eq('verification_status', 'pending')
            .order('created_at', { ascending: true });

        if (roomId) {
            query = query.eq('room_id', roomId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const verifications = data?.map((v: any) => ({
            id: v.id,
            email: v.email,
            identifier: v.identifier,
            gov_id_url: v.gov_id_url,
            photo_url: v.photo_url,
            created_at: v.created_at,
            room_id: v.room_id,
            room_title: v.voting_rooms.title
        })) || [];

        return NextResponse.json({
            verifications,
            count: verifications.length
        });

    } catch (error: any) {
        console.error('[ADMIN] Get pending verifications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch verifications' },
            { status: 500 }
        );
    }
}
