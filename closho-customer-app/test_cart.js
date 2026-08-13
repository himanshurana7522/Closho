const axios = require('axios');
const BASE_URL = 'https://api-closho.onrender.com';

async function testDeleteCart() {
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;

    const headers = { Authorization: `Bearer ${token}` };

    const cartRes = await axios.delete(`${BASE_URL}/cart`, { headers });
    console.log(JSON.stringify(cartRes.data, null, 2));

  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
  }
}

testDeleteCart();
