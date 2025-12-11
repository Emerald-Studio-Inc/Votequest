require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL Set:', !!url);
console.log('Key Set:', !!key);

if (!url || !key) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
    console.log('Testing connection...');
    const { data, error } = await supabase.from('notifications').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Count:', data); // data is null for head:true usually but count is in wrapper
    }
}

test();
