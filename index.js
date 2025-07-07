const BACKEND_URL = 'http://localhost:9000';
const email = 'test@test.com';
const password = 'secret';
const PUBLISHABLE_API_KEY = 'pk_aa081f23d08492f224b986e46a3c95d202acdadd2fa9d030e61775dde5ae5947';

async function main() {
  try {
    // 1. Login to get JWT
    const loginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');
    const jwtToken = loginData.token;
    console.log(jwtToken);

    // 2. Exchange JWT for session cookie
    const sessionRes = await fetch(`${BACKEND_URL}/auth/session`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const rawSetCookie = sessionRes.headers.get('set-cookie');
    if (!rawSetCookie) throw new Error('No session cookie received');
    const sidMatch = rawSetCookie.match(/connect\.sid=([^;]+)/);
    if (!sidMatch) throw new Error('Session ID not found');
    const sessionId = sidMatch[1];

    // Order simulation
    const orderId = '12345';
    const order = {
      id: orderId,
      shipping_address: {
        first_name: 'demo',
        last_name: 'test',
        address_1: '123 Main St',
        postal_code: '12345',
        city: 'Sample City',
        country_code: 'US',
        phone: '+1234567890',
        company: 'ACME Corp',
      },
      customer: {
        email: 'test@test.com',
      },
    };

    // SendCloud Label Generation
    const labelRes = await fetch(`${BACKEND_URL}/store/sendscloud/label/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
        Cookie: `connect.sid=${sessionId}`,
      },
      body: JSON.stringify({ order }),
    });

    const labelData = await labelRes.json();
    console.log('Label Data:', labelData);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();