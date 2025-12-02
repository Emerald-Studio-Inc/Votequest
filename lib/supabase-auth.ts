import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export async function signInWithMagicLink(email: string) {
    // Use production URL from env var, or fallback to current origin
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${redirectUrl}/auth/callback`,
        },
    });
    return { error };
}

export async function signOut() {
    await supabase.auth.signOut();
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user ?? null);
    });
}

// User profile functions
export interface UserProfile {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    age_verified: boolean;
    voting_interests?: string[];
    notification_email: boolean;
    notification_in_app: boolean;
    xp: number;
    level: number;
    coins: number;
    votes_count: number;
    voting_power: number;
    streak: number;
    global_rank: number;
}

export async function createUserProfile(authId: string, email: string, username: string, ageVerified: boolean): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('users')
        .insert([{
            auth_id: authId,
            email,
            username,
            age_verified: ageVerified,
            xp: 0,
            level: 1,
            coins: 0,
            votes_count: 0,
            voting_power: 100,
            streak: 0,
            global_rank: 0,
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating user profile:', error);
        return null;
    }

    return data as UserProfile;
}

export async function getUserProfile(authId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }

    return data as UserProfile;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating user profile:', error);
        return false;
    }

    return true;
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return null;
    }

    const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
    const { data } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

    return !data; // Returns true if username is available (no data found)
}
