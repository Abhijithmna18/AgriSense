const axios = require('axios');

async function test() {
    try {
        const city = 'kottayam, Kerala';
        const { data } = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
            params: { name: city, count: 1, language: 'en', format: 'json' },
            timeout: 8000
        });
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("AXIOS ERROR:", e.message);
    }
}

test();
