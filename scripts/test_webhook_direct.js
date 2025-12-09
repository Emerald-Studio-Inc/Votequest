const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.argv[2];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function runDirectTest() {
    console.log(`Running direct DB update for user: ${USER_ID}`);

    // Mock data from webhook
    const amount = 200; // Starter pack
    const tx_ref = `test_direct_${Date.now()}`;

    // Get current balance
    const { data: user, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('coins')
        .eq('id', USER_ID)
        .single();

    if (fetchError || !user) {
        console.error('Error fetching user:', fetchError);
        return;
    }

    const newBalance = (user.coins || 0) + amount;

    // Update coins
    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ coins: newBalance })
        .eq('id', USER_ID);

    if (updateError) {
        console.error('Error updating coins:', updateError);
        return;
    }

    console.log(`✅ Updated coins: ${user.coins} -> ${newBalance}`);

    // Create notification
    const { error: notifError } = await supabaseAdmin.from('notifications').insert({
        user_id: USER_ID,
        type: 'coins_purchased',
        title: 'Coins Purchased (Test)',
        message: `Successfully purchased ${amount} coins (Direct Test)`,
        metadata: { amount, tx_ref },
        read: false
    });

    if (notifError) {
        console.error('Error creating notification:', notifError);
    } else {
        console.log('✅ Notification created');
    }
}

runDirectTest();
