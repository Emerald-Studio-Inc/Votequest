import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Upload government ID for Tier 3 verification
 * POST /api/rooms/[roomId]/upload-verification
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const govId = formData.get('govId') as File;
        const photo = formData.get('photo') as File | null;
        const { id: roomId } = params;

        if (!email || !govId) {
            return NextResponse.json(
                { error: 'Email and government ID required' },
                { status: 400 }
            );
        }

        // Check room tier
        const { data: room } = await supabaseAdmin
            .from('voting_rooms')
            .select('verification_tier')
            .eq('id', roomId)
            .single();

        if (room?.verification_tier !== 'tier3') {
            return NextResponse.json(
                { error: 'This room does not require government ID verification' },
                { status: 400 }
            );
        }

        // Save files (in production: use cloud storage like S3/Cloudflare R2)
        const timestamp = Date.now();
        const govIdPath = join(process.cwd(), 'uploads', `gov-id-${timestamp}-${govId.name}`);
        const govIdBuffer = Buffer.from(await govId.arrayBuffer());
        await writeFile(govIdPath, govIdBuffer);

        let photoPath = null;
        if (photo) {
            photoPath = join(process.cwd(), 'uploads', `photo-${timestamp}-${photo.name}`);
            const photoBuffer = Buffer.from(await photo.arrayBuffer());
            await writeFile(photoPath, photoBuffer);
        }

        // Update/create eligibility record with pending status
        const { data: existing } = await supabaseAdmin
            .from('voter_eligibility')
            .select('*')
            .eq('room_id', roomId)
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            // Update existing
            await supabaseAdmin
                .from('voter_eligibility')
                .update({
                    verification_status: 'pending',
                    gov_id_url: govIdPath,
                    photo_url: photoPath,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);
        } else {
            // Create new (open voting - anyone can submit)
            await supabaseAdmin
                .from('voter_eligibility')
                .insert({
                    room_id: roomId,
                    email: email.toLowerCase(),
                    verification_status: 'pending',
                    gov_id_url: govIdPath,
                    photo_url: photoPath
                });
        }

        return NextResponse.json({
            success: true,
            message: 'Verification submitted for review'
        });

    } catch (error: any) {
        console.error('[API] Upload verification error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}
