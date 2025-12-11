
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching active rooms...');
    const { data: rooms, error } = await supabase
        .from('voting_rooms')
        .select('id, title, status, voting_strategy')
        .eq('status', 'active')
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!rooms || rooms.length === 0) {
        console.log('No active rooms found.');
        return;
    }

    rooms.forEach(room => {
        console.log(`\nRoom: ${room.title}`);
        console.log(`ID: ${room.id}`);
        console.log(`Strategy: ${room.voting_strategy}`);
        console.log(`URL: http://localhost:3000/vote/${room.id}`);
    });
}

main();
