const axios = require('axios');

async function testFrontendSimulated() {
    try {
        const response = await fetch("http://localhost:5002/api/ai/irrigation-recommendation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer null`
            },
            body: JSON.stringify({ soilMoisture: 30, temperature: 32, humidity: 40 })
        });
        const data = await response.text();
        console.log("Status:", response.status);
        console.log("Body:", data);
    } catch (e) {
        console.log("Error:", e);
    }
}
testFrontendSimulated();
