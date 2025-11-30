// VOTE DEBUGGING SCRIPT
// Run in browser console WHILE voting to see exact errors

console.log('🔍 Vote Debug Script Loaded');

// Override fetch to log all /api/vote calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    const [url, options] = args;

    if (url.includes('/api/vote')) {
        console.log('📤 VOTE API CALL:');
        console.log('URL:', url);
        console.log('Method:', options?.method);
        console.log('Body:', options?.body);

        try {
            const response = await originalFetch(...args);
            const clone = response.clone();
            const data = await clone.json();

            console.log('📥 VOTE API RESPONSE:');
            console.log('Status:', response.status);
            console.log('Data:', data);

            if (!response.ok) {
                console.error('❌ VOTE FAILED:', data);
            } else {
                console.log('✅ VOTE API SAID SUCCESS');

                // Now check if it ACTUALLY saved
                setTimeout(async () => {
                    console.log('🔍 Checking if vote was saved...');
                    // User should run SQL: SELECT COUNT(*) FROM votes WHERE user_id = 'YOUR_ID'
                }, 1000);
            }

            return response;
        } catch (error) {
            console.error('❌ FETCH ERROR:', error);
            throw error;
        }
    }

    return originalFetch(...args);
};

console.log('✅ Vote debugging active - try voting now!');
console.log('💡 Watch for 📤 and 📥 messages above');
