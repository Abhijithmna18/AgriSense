
const axios = require('axios');

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5002/api/auth/register', {
            firstName: "Test",
            lastName: "User",
            email: "test.user." + Date.now() + "@example.com",
            phone: "+1234567890",
            password: "password123",
            roles: ["buyer"]
        });
        console.log("Success:", response.data);
    } catch (error) {
        if (error.response) {
            console.log("Error Status:", error.response.status);
            console.log("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

testRegister();
