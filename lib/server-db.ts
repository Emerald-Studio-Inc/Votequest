import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. API routes will fail.');
    console.warn('   Please add it to .env.local and restart the server.');
}

// Create client only if key is available (runtime), otherwise return a proxy that throws helpful errors
export const supabaseAdmin = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : new Proxy({} as any, {
        get: () => {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local and restart the server.');
        }
    });
