const axios = require('axios');

// Using 5002 as per user report
const API_URL = 'http://localhost:5002/api';

async function run() {
    try {
        console.log(`Targeting API: ${API_URL}`);

        // 1. Register/Login
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`1. Registering/Logging in as ${email}...`);

        try {
            await axios.post(`${API_URL}/auth/register`, {
                name: 'Debug User',
                email,
                password,
                role: 'farmer'
            });
        } catch (e) {
            // Include login fallback if already exists (unlikely with timestamp)
        }

        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        console.log('   Login successful.');

        // 2. Get Warehouses
        console.log('2. Fetching Warehouses...');
        const whRes = await axios.get(`${API_URL}/warehouses`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!whRes.data.data || whRes.data.data.length === 0) {
            console.error('   No warehouses found. Cannot proceed.');
            return;
        }

        const warehouse = whRes.data.data[0];
        console.log(`   Selected: ${warehouse.name} (ID: ${warehouse._id})`);

        // 3. Create Booking
        console.log('3. Submitting Booking Request...');
        const payload = {
            warehouseId: warehouse._id,
            cropName: warehouse.specifications.supportedCrops[0] || 'Wheat',
            cropType: 'grain',
            quantity: 5, // Valid quantity > 0.1
            startDate: new Date().toISOString().split('T')[0],
            duration: 30,
            notes: 'Debug test'
        };
        console.log('   Payload:', payload);

        const bookRes = await axios.post(`${API_URL}/bookings`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('SUCCESS: Booking Created!', bookRes.data);

    } catch (error) {
        console.error('FAILED:');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('   No response received (Connection Refused/Timeout).');
            console.error('   Error:', error.message);
        } else {
            console.error('   Error:', error.message);
        }
    }
}

run();
