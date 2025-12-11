async function testApi() {
    const userId = '1ab0a77f-1ab7-4c8e-8ddc-1e1b496dea9e';
    try {
        const res = await fetch(`http://localhost:3000/api/notifications?userId=${userId}`);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}
testApi();
