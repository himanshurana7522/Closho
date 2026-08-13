const axios = require('axios');
const BASE_URL = 'https://api-closho.onrender.com';

async function testReels() {
  try {
    const res = await axios.get(`${BASE_URL}/reels?limit=5`);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
  }
}

testReels();
