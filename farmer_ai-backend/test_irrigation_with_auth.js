const axios = require('axios');

async function testIrrigation() {
    try {
        console.log("Logging in as abhijithn893@gmail.com...");
        const loginRes = await axios.post('http://localhost:5002/api/auth/login', {
            email: 'abhijithn893@gmail.com',
            password: 'Abhi@1234'
        });

        const token = loginRes.data.token;
        console.log("Token obtained successfully.");

        const testTelemetry = { soilMoisture: 38, temperature: 24.7, humidity: 52, waterFlow: 0.36 };
        console.log("Testing irrigation recommendation with telemetry:", testTelemetry);

        const res = await axios.post('http://localhost:5002/api/ai/irrigation-recommendation', testTelemetry, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("\nAI Recommendation Response:");
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("\nError:");
        if (e.response) {
            console.error(e.response.status, e.response.data);
        } else {
            console.error(e.message);
        }
    }
}

testIrrigation();
