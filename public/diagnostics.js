// VoteQuest System Diagnostic Tool
// Run this in browser console to identify all issues

console.log('🔍 VoteQuest System Diagnostic Starting...\n');

// 1. Check CAPTCHA
console.log('1️⃣ CAPTCHA Status:');
const captchaWidgets = document.querySelectorAll('[data-turnstile]');
console.log('  - CAPTCHA widgets found:', captchaWidgets.length);
console.log('  - Site key configured:', !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

// 2. Check User Data
console.log('\n2️⃣ User Data:');
fetch('/api/user/me')
    .then(r => r.json())
    .then(data => {
        console.log('  - User ID:', data.userId || 'NOT FOUND');
        console.log('  - XP:', data.xp);
        console.log('  - Coins:', data.coins);
        console.log('  - Votes count:', data.votesCount);
    })
    .catch(e => console.error('  ❌ Failed to fetch user:', e));

// 3. Check Proposals Synced to Database
console.log('\n3️⃣ Checking Proposal Sync:');
fetch('/api/proposal/list')
    .then(r => r.json())
    .then(data => {
        console.log('  - Total proposals in DB:', data.length);
        console.log('  - Blockchain IDs:', data.map(p => p.blockchain_id).filter(Boolean).length);
    })
    .catch(e => console.error('  ❌ Failed to fetch proposals:', e));

// 4. Test Vote API
console.log('\n4️⃣ Testing Vote API:');
console.log('  To test, try voting and check Network tab for /api/vote');
console.log('  Look for status codes:');
console.log('    - 200 = Success');
console.log('    - 400 = Bad request (missing CAPTCHA or invalid data)');
console.log('    - 403 = Forbidden (CAPTCHA failed)');
console.log('    - 404 = Proposal/option not found in DB');

// 5. Check Notifications
console.log('\n5️⃣ Notifications:');
fetch('/api/notifications')
    .then(r => r.json())
    .then(data => {
        console.log('  - Total notifications:', data.length);
        console.log('  - Unread:', data.filter(n => !n.read).length);
    })
    .catch(e => console.error('  ❌ Failed to fetch notifications:', e));

console.log('\n✅ Diagnostic complete! Check above for issues.');
console.log('💡 Next: Try voting and check Network tab for errors');
