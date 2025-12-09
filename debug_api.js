const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function test() {
    try {
        console.log('Fetching plans from API...');
        const res = await axios.get(`${API_URL}/plans`);
        console.log('Status:', res.status);
        console.log('Count:', res.data.count);
        console.log('Plans:', JSON.stringify(res.data.data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response:', err.response.data);
        }
    }
}

test();
