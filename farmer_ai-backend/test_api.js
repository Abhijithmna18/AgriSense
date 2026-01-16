const axios = require('axios');

// Test the orders endpoint
const testAPI = async () => {
    try {
        // First login to get token
        const loginRes = await axios.post('http://localhost:5002/api/auth/login', {
            email: 'abhijithn893@gmail.com',
            password: 'Abhi@1234'
        });

        const token = loginRes.data.token;
        console.log('Login successful, token received\n');

        // Now fetch orders
        const ordersRes = await axios.get('http://localhost:5002/api/marketplace/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Orders API Response:');
        console.log('Status:', ordersRes.status);
        console.log('Data type:', Array.isArray(ordersRes.data) ? 'Array' : typeof ordersRes.data);
        console.log('Number of orders:', ordersRes.data.length || 0);

        if (ordersRes.data.length > 0) {
            console.log('\nFirst order sample:');
            console.log(JSON.stringify(ordersRes.data[0], null, 2));
        } else {
            console.log('\nNo orders returned from API');
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

testAPI();
