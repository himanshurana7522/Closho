const axios = require('axios');
const BASE_URL = 'https://api-closho.onrender.com';

async function testAddToCart() {
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;

    const listRes = await axios.get(`${BASE_URL}/products?limit=1`);
    const product = listRes.data.data[0];
    
    const storeRes = await axios.get(`${BASE_URL}/stores/nearest?lat=28.7041&lng=77.1025&radius=100`);
    const storeId = storeRes.data.data[0]?.id;

    console.log('Sending Add to Cart:');
    const payload = {
      storeId: storeId,
      productId: product.id,
      quantity: 1
    };
    console.log(payload);
    
    const addRes = await axios.post(`${BASE_URL}/cart/items`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', addRes.data);

    // Try modifying quantity
    const cartItemId = addRes.data.data.items[0].id;
    const patchRes = await axios.patch(`${BASE_URL}/cart/items/${cartItemId}`, { quantity: 2 }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Patch Success:', patchRes.data);

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

testAddToCart();
