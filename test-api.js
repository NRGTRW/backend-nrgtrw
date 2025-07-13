import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test if server is running
    console.log('\n1. Testing server health...');
    const healthResponse = await fetch('http://localhost:8080/health');
    console.log('Health status:', healthResponse.status);
    
    // Test waitlist admin endpoint (without auth - should fail)
    console.log('\n2. Testing waitlist admin endpoint without auth...');
    try {
      const response = await fetch('http://localhost:8080/api/waitlist/admin');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
    } catch (error) {
      console.log('Expected error (no auth):', error.message);
    }
    
    console.log('\n✅ API test completed');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testAPI(); 