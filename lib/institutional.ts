import { supabaseAdmin } from './server-db';

/**
 * Helper functions for institutional voting system
 */

// ==========================================
// ORGANIZATION HELPERS
// ==========================================

export interface Organization {
    id: string;
    name: string;
    type: 'school' | 'company' | 'nonprofit' | 'government' | 'other';
    domain?: string;
    subscription_tier: 'free' | 'school' | 'enterprise';
    max_voters_per_room: number;
    max_rooms: number;
}

export async function createOrganization(
    name: string,
    type: Organization['type'],
    createdBy: string,
    domain?: string
): Promise<{ organization?: Organization; error?: string }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('organizations')
            .insert({
                name,
                type,
                domain,
                created_by: createdBy,
                subscription_tier: 'free',
                max_voters_per_room: 100,
                max_rooms: 5
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating organization:', error);
            return { error: error.message };
        }

        // Add creator as owner
        await supabaseAdmin
            .from('organization_admins')
            .insert({
                organization_id: data.id,
                user_id: createdBy,
                role: 'owner'
            });

        return { organization: data };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
    const { data } = await supabaseAdmin
        .from('organization_admins')
        .select('organization_id, organizations(*)')
        .eq('user_id', userId);

    return data?.map((d: any) => d.organizations).filter(Boolean) || [];
}

export async function isOrgAdmin(userId: string, orgId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
        .from('organization_admins')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();

    return !!data;
}

// ==========================================
// VOTING ROOM HELPERS  
// ==========================================

export interface VotingRoom {
    id: string;
    organization_id: string;
    title: string;
    description?: string;
    verification_tier: 'tier1' | 'tier2' | 'tier3';
    status: 'draft' | 'active' | 'closed' | 'archived';
    start_time?: string;
    end_time?: string;
    max_voters?: number;
}

export async function createRoom(
    organizationId: string,
    title: string,
    description: string,
    verificationTier: VotingRoom['verification_tier'],
    createdBy: string,
    options: Array<{ title: string; description?: string }>
): Promise<{ room?: VotingRoom; error?: string }> {
    try {
        // Check organization limits
        const { data: org } = await supabaseAdmin
            .from('organizations')
            .select('max_rooms')
            .eq('id', organizationId)
            .single();

        if (!org) {
            return { error: 'Organization not found' };
        }

        const { count } = await supabaseAdmin
            .from('voting_rooms')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .neq('status', 'archived');

        if (count && count >= org.max_rooms) {
            return { error: `Room limit reached (${org.max_rooms}). Upgrade your plan.` };
        }

        // Create room
        const { data: room, error: roomError } = await supabaseAdmin
            .from('voting_rooms')
            .insert({
                organization_id: organizationId,
                title,
                description,
                verification_tier: verificationTier,
                created_by: createdBy,
                status: 'draft'
            })
            .select()
            .single();

        if (roomError) {
            return { error: roomError.message };
        }

        // Create options
        const roomOptions = options.map((opt, idx) => ({
            room_id: room.id,
            title: opt.title,
            description: opt.description,
            option_number: idx
        }));

        const { error: optionsError } = await supabaseAdmin
            .from('room_options')
            .insert(roomOptions);

        if (optionsError) {
            // Rollback room creation
            await supabaseAdmin
                .from('voting_rooms')
                .delete()
                .eq('id', room.id);
            return { error: optionsError.message };
        }

        return { room };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getRoomDetails(roomId: string) {
    const { data: room } = await supabaseAdmin
        .from('voting_rooms')
        .select(`
      *,
      room_options(*),
      organizations(name, type)
    `)
        .eq('id', roomId)
        .single();

    return room;
}

// ==========================================
// VOTER ELIGIBILITY HELPERS
// ==========================================

export async function addVoterToEligibilityList(
    roomId: string,
    identifier: string,
    identifierType: 'email' | 'student_id' | 'employee_id',
    metadata?: any
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabaseAdmin
            .from('voter_eligibility')
            .insert({
                room_id: roomId,
                identifier: identifier.toLowerCase(),
                identifier_type: identifierType,
                metadata: metadata || {},
                status: 'pending'
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: false, error: 'Voter already in eligibility list' };
            }
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function bulkUploadVoters(
    roomId: string,
    voters: Array<{ identifier: string; identifierType: string; metadata?: any }>
): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const voter of voters) {
        const result = await addVoterToEligibilityList(
            roomId,
            voter.identifier,
            voter.identifierType as any,
            voter.metadata
        );

        if (result.success) {
            success++;
        } else {
            failed++;
            errors.push(`${voter.identifier}: ${result.error}`);
        }
    }

    return { success, failed, errors };
}

export async function isUserEligibleForRoom(
    userId: string,
    roomId: string
): Promise<boolean> {
    // Check if user is in eligibility list
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

    if (!user) return false;

    const { data: eligibility } = await supabaseAdmin
        .from('voter_eligibility')
        .select('id')
        .eq('room_id', roomId)
        .or(`identifier.eq.${user.email},user_id.eq.${userId}`)
        .eq('status', 'verified')
        .single();

    return !!eligibility;
}

// ==========================================
// VERIFICATION HELPERS
// ==========================================

export async function getUserVerificationStatus(
    userId: string,
    verificationType: 'student_id' | 'employee_id' | 'government_id'
) {
    const { data } = await supabaseAdmin
        .from('id_verifications')
        .select('*')
        .eq('user_id', userId)
        .eq('verification_type', verificationType)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return data;
}

export async function canUserVoteInRoom(
    userId: string,
    roomId: string
): Promise<{ canVote: boolean; reason?: string }> {
    // 1. Check if room is active
    const { data: room } = await supabaseAdmin
        .from('voting_rooms')
        .select('status, verification_tier, start_time, end_time')
        .eq('id', roomId)
        .single();

    if (!room) {
        return { canVote: false, reason: 'Room not found' };
    }

    if (room.status !== 'active') {
        return { canVote: false, reason: 'Room is not active' };
    }

    // Check time window
    const now = new Date();
    if (room.start_time && new Date(room.start_time) > now) {
        return { canVote: false, reason: 'Voting has not started yet' };
    }
    if (room.end_time && new Date(room.end_time) < now) {
        return { canVote: false, reason: 'Voting has ended' };
    }

    // 2. Check eligibility
    const isEligible = await isUserEligibleForRoom(userId, roomId);
    if (!isEligible) {
        return { canVote: false, reason: 'You are not eligible to vote in this room' };
    }

    // 3. Check verification tier
    if (room.verification_tier === 'tier2' || room.verification_tier === 'tier3') {
        const verificationType = room.verification_tier === 'tier2' ? 'student_id' : 'government_id';
        const verification = await getUserVerificationStatus(userId, verificationType as any);

        if (!verification || verification.verification_status !== 'approved') {
            return { canVote: false, reason: `Please verify your ${verificationType.replace('_', ' ')} first` };
        }
    }

    // 4. Check if already voted
    const { data: existingVote } = await supabaseAdmin
        .from('room_votes')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();

    if (existingVote) {
        return { canVote: false, reason: 'You have already voted' };
    }

    return { canVote: true };
}

// ==========================================
// VOTING HELPERS
// ==========================================

export async function castRoomVote(
    userId: string,
    roomId: string,
    optionId: string,
    metadata?: any
): Promise<{ success: boolean; error?: string }> {
    try {
        // Verify user can vote
        const { canVote, reason } = await canUserVoteInRoom(userId, roomId);
        if (!canVote) {
            return { success: false, error: reason };
        }

        // Get verification ID if needed
        const { data: room } = await supabaseAdmin
            .from('voting_rooms')
            .select('verification_tier')
            .eq('id', roomId)
            .single();

        let verificationId = null;
        if (room && room.verification_tier !== 'tier1') {
            const verificationType = room.verification_tier === 'tier2' ? 'student_id' : 'government_id';
            const verification = await getUserVerificationStatus(userId, verificationType as any);
            verificationId = verification?.id || null;
        }

        // Get eligibility ID
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

        const { data: eligibility } = await supabaseAdmin
            .from('voter_eligibility')
            .select('id')
            .eq('room_id', roomId)
            .or(`identifier.eq.${user?.email},user_id.eq.${userId}`)
            .single();

        // Cast vote
        const { error } = await supabaseAdmin
            .from('room_votes')
            .insert({
                room_id: roomId,
                user_id: userId,
                option_id: optionId,
                verification_id: verificationId,
                eligibility_id: eligibility?.id,
                metadata: metadata || {}
            });

        if (error) {
            return { success: false, error: error.message };
        }

        // Update eligibility status to 'verified'
        if (eligibility) {
            await supabaseAdmin
                .from('voter_eligibility')
                .update({ status: 'verified', verified_at: new Date().toISOString() })
                .eq('id', eligibility.id);
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
