const crypto = require('crypto');
const http = require('http');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const USER_ID = process.argv[2];

if (!SECRET_KEY) {
    console.error('❌ Error: FLUTTERWAVE_SECRET_KEY not found in .env.local');
    process.exit(1);
}

if (!USER_ID) {
    console.error('❌ Error: USER_ID argument required');
    console.log('Usage: node scripts/verify_monetization.js <user_uuid>');
    process.exit(1);
}

// Mock Webhook Payload
const payload = {
    event: 'charge.completed',
    data: {
        id: Math.floor(Math.random() * 1000000),
        tx_ref: `test_txn_${Date.now()}`,
        flw_ref: `flw_ref_${Date.now()}`,
        device_fingerprint: 'test_device',
        amount: 1500,
        currency: 'NGN',
        charged_amount: 1500,
        app_fee: 0,
        merchant_fee: 0,
        processor_response: 'Approved',
        auth_model: 'Card',
        ip: '127.0.0.1',
        narration: 'VoteQuest Coin Purchase',
        status: 'successful',
        payment_type: 'card',
        created_at: new Date().toISOString(),
        account_id: 12345,
        customer: {
            id: 999,
            name: 'Test User',
            phone_number: '08012345678',
            email: 'test@example.com',
            created_at: new Date().toISOString()
        },
        meta: {
            type: 'coin_purchase',
            userId: USER_ID,
            vqcAmount: '200',
            bonusVqc: '0',
            packageType: 'starter'
        }
    }
};

const payloadString = JSON.stringify(payload);

// Generate Signature
const signature = crypto.createHmac('sha256', SECRET_KEY)
    .update(payloadString)
    .digest('hex');

console.log(`🚀 Sending mock webhook for User: ${USER_ID}`);
console.log(`🔑 Signature generated: ${signature.substring(0, 10)}...`);

// Send Request
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/flutterwave/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'verif-hash': signature
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`\n📡 Status Code: ${res.statusCode}`);
        console.log(`📄 Response: ${data}`);

        if (res.statusCode === 200) {
            console.log('\n✅ Webhook simulation SUCCESSFUL!');
            console.log('👉 Check the database to confirm:');
            console.log(`   1. User ${USER_ID} coins increased by 200`);
            console.log('   2. Notification created');
            console.log('   3. coin_purchases record created');
        } else {
            console.error('\n❌ Webhook simulation FAILED');
        }
    });
});

req.on('error', (error) => {
    console.error('\n❌ Request Error:', error.message);
});

req.write(payloadString);
req.end();
