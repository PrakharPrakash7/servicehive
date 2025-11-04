const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let userId = '';
let eventId1 = '';
let eventId2 = '';
let swapRequestId = '';

// Test user credentials
const testUser1 = {
  email: 'testuser1@example.com',
  password: 'password123',
  name: 'Test User 1'
};

const testUser2 = {
  email: 'testuser2@example.com',
  password: 'password123',
  name: 'Test User 2'
};

async function testHealthCheck() {
  console.log('\n📍 Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testSignup(user) {
  console.log(`\n📍 Testing Signup for ${user.email}...`);
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, user);
    console.log('✅ Signup Success:', response.data.message);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error.includes('already exists')) {
      console.log('ℹ️  User already exists, will try login');
      return null;
    }
    console.error('❌ Signup Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testLogin(user) {
  console.log(`\n📍 Testing Login for ${user.email}...`);
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: user.email,
      password: user.password
    });
    console.log('✅ Login Success:', response.data.message);
    return response.data;
  } catch (error) {
    console.error('❌ Login Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetProfile(token) {
  console.log('\n📍 Testing Get Profile...');
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile Retrieved:', response.data.user.email);
    return response.data.user;
  } catch (error) {
    console.error('❌ Get Profile Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateEvent(token, eventData) {
  console.log('\n📍 Testing Create Event...');
  try {
    const response = await axios.post(`${BASE_URL}/api/events`, eventData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Event Created:', response.data.event.title);
    return response.data.event;
  } catch (error) {
    console.error('❌ Create Event Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetAllEvents(token) {
  console.log('\n📍 Testing Get All Events...');
  try {
    const response = await axios.get(`${BASE_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Retrieved ${response.data.events.length} events`);
    return response.data.events;
  } catch (error) {
    console.error('❌ Get All Events Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testUpdateEvent(token, eventId, updates) {
  console.log('\n📍 Testing Update Event...');
  try {
    const response = await axios.put(`${BASE_URL}/api/events/${eventId}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Event Updated:', response.data.event.status);
    return response.data.event;
  } catch (error) {
    console.error('❌ Update Event Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetSwappableSlots(token) {
  console.log('\n📍 Testing Get Swappable Slots...');
  try {
    const response = await axios.get(`${BASE_URL}/api/swappable-slots`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Retrieved ${response.data.slots.length} swappable slots`);
    return response.data.slots;
  } catch (error) {
    console.error('❌ Get Swappable Slots Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateSwapRequest(token, mySlotId, theirSlotId) {
  console.log('\n📍 Testing Create Swap Request...');
  try {
    const response = await axios.post(`${BASE_URL}/api/swap-request`, {
      mySlotId,
      theirSlotId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Swap Request Created:', response.data.message);
    return response.data.swapRequest;
  } catch (error) {
    console.error('❌ Create Swap Request Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetIncomingRequests(token) {
  console.log('\n📍 Testing Get Incoming Requests...');
  try {
    const response = await axios.get(`${BASE_URL}/api/swap-requests/incoming`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Retrieved ${response.data.requests.length} incoming requests`);
    return response.data.requests;
  } catch (error) {
    console.error('❌ Get Incoming Requests Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetOutgoingRequests(token) {
  console.log('\n📍 Testing Get Outgoing Requests...');
  try {
    const response = await axios.get(`${BASE_URL}/api/swap-requests/outgoing`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Retrieved ${response.data.requests.length} outgoing requests`);
    return response.data.requests;
  } catch (error) {
    console.error('❌ Get Outgoing Requests Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testRespondToSwapRequest(token, requestId, accept) {
  console.log(`\n📍 Testing ${accept ? 'Accept' : 'Reject'} Swap Request...`);
  try {
    const response = await axios.post(`${BASE_URL}/api/swap-response/${requestId}`, {
      accept
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Swap Request ${accept ? 'Accepted' : 'Rejected'}:`, response.data.message);
    return response.data.swapRequest;
  } catch (error) {
    console.error(`❌ Respond to Swap Request Failed:`, error.response?.data || error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('='+ '='.repeat(50));

  // 1. Health Check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Server is not running. Please start the backend server.');
    return;
  }

  // 2. User 1 - Signup & Login
  console.log('\n\n' + '='.repeat(50));
  console.log('Testing User 1 Flow');
  console.log('='.repeat(50));
  
  await testSignup(testUser1);
  const loginData1 = await testLogin(testUser1);
  if (!loginData1) {
    console.log('\n❌ Cannot proceed without User 1 login');
    return;
  }
  const token1 = loginData1.token;
  
  const user1Profile = await testGetProfile(token1);

  // 3. User 1 - Create Events
  const event1Data = {
    title: 'User 1 Meeting',
    startTime: '2024-11-20T10:00',
    endTime: '2024-11-20T11:00',
    status: 'SWAPPABLE'
  };
  
  const event1 = await testCreateEvent(token1, event1Data);
  if (event1) eventId1 = event1.id;

  // 4. Get all User 1 events
  await testGetAllEvents(token1);

  // 5. User 2 - Signup & Login
  console.log('\n\n' + '='.repeat(50));
  console.log('Testing User 2 Flow');
  console.log('='.repeat(50));
  
  await testSignup(testUser2);
  const loginData2 = await testLogin(testUser2);
  if (!loginData2) {
    console.log('\n❌ Cannot proceed without User 2 login');
    return;
  }
  const token2 = loginData2.token;

  // 6. User 2 - Create Event
  const event2Data = {
    title: 'User 2 Workshop',
    startTime: '2024-11-21T14:00',
    endTime: '2024-11-21T15:30',
    status: 'SWAPPABLE'
  };
  
  const event2 = await testCreateEvent(token2, event2Data);
  if (event2) eventId2 = event2.id;

  // 7. User 2 - Get swappable slots (should see User 1's event)
  const swappableSlots = await testGetSwappableSlots(token2);

  // 8. User 2 - Create swap request
  console.log('\n\n' + '='.repeat(50));
  console.log('Testing Swap Flow');
  console.log('='.repeat(50));
  
  if (eventId1 && eventId2) {
    const swapRequest = await testCreateSwapRequest(token2, eventId2, eventId1);
    if (swapRequest) swapRequestId = swapRequest.id;

    // 9. User 2 - Check outgoing requests
    await testGetOutgoingRequests(token2);

    // 10. User 1 - Check incoming requests
    const incomingRequests = await testGetIncomingRequests(token1);

    // 11. User 1 - Accept the swap
    if (swapRequestId) {
      await testRespondToSwapRequest(token1, swapRequestId, true);
      
      // 12. Verify events were swapped
      console.log('\n📍 Verifying swap completion...');
      const user1Events = await testGetAllEvents(token1);
      const user2Events = await testGetAllEvents(token2);
      
      if (user1Events && user2Events) {
        console.log('✅ User 1 now has', user1Events.length, 'events');
        console.log('✅ User 2 now has', user2Events.length, 'events');
      }
    }
  }

  console.log('\n\n' + '='.repeat(50));
  console.log('✅ All API tests completed!');
  console.log('='.repeat(50));
}

// Run the tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
