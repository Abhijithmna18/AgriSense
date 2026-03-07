const jwt = require('jsonwebtoken');

const testTelemetry = {
    soilMoisture: 30, // Should recommend irrigation
    temperature: 32,
    humidity: 40
};

// Generate a fake token
const token = jwt.sign({ id: 'test_user_id' }, 'your_jwt_secret_here', { expiresIn: '1h' });

fetch('http://localhost:5002/api/ai/irrigation-recommendation', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testTelemetry)
})
    .then(res => res.json())
    .then(data => console.log('Response:', data))
    .catch(err => console.error('Error:', err));
