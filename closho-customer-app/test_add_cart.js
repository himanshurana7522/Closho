const axios = require('axios');
const BASE_URL = 'https://api-closho.onrender.com';

async function testAddToCart() {
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const listRes = await axios.get(`${BASE_URL}/products?limit=1`);
    const productId = listRes.data.data[0].id;

    console.log('Adding product to cart:', productId);
    const addRes = await axios.post(`${BASE_URL}/cart/items`, {
      productId: productId,
      quantity: 1,
      // I am omitting storeId to see if it causes an error
    }, { headers });
    
    console.log('Success:', addRes.data);
  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
  }
}

testAddToCart();
