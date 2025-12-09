const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCoins() {
    const { data } = await supabase.from('users').select('coins').limit(1).single();
    console.log(`COINS:${data.coins}`);
}

checkCoins();
