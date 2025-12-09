const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUser() {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, coins')
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        process.exit(1);
    }

    if (!data) {
        console.error('No users found in database');
        process.exit(1);
    }

    console.log(`User ID: ${data.id}`);
    console.log(`Coins: ${data.coins}`);
    console.log(`Email: ${data.email}`);
}

getUser();
