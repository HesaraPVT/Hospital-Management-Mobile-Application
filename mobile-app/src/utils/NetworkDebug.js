import axios from 'axios';

export const testNetworkConnectivity = async (baseUrl) => {
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl,
    tests: {},
  };

  // Test 1: Network reachability
  try {
    console.log(`🌐 Testing network reachability to ${baseUrl}...`);
    const response = await axios.get(`${baseUrl}`, { timeout: 5000 });
    results.tests.baseUrlReachable = {
      status: 'success',
      message: 'Base URL is reachable',
      responseStatus: response.status,
    };
    console.log('✅ Base URL is reachable');
  } catch (error) {
    results.tests.baseUrlReachable = {
      status: 'failed',
      message: error.message,
      errorCode: error.code,
    };
    console.log('❌ Base URL is NOT reachable:', error.message);
  }

  // Test 2: Login endpoint exists
  try {
    console.log('🔐 Testing login endpoint...');
    await axios.post(`${baseUrl}/auth/login`, 
      { email: 'test@test.com', password: 'test' }, 
      { timeout: 5000 }
    );
    results.tests.loginEndpoint = {
      status: 'success',
      message: 'Login endpoint responds (even if auth failed)',
    };
    console.log('✅ Login endpoint responds');
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 400) {
      // 401/400 is fine - it means server responded
      results.tests.loginEndpoint = {
        status: 'success',
        message: 'Login endpoint responds (auth validation working)',
        responseStatus: error.response?.status,
      };
      console.log('✅ Login endpoint responds (validation working)');
    } else {
      results.tests.loginEndpoint = {
        status: 'failed',
        message: error.message,
        errorCode: error.code,
      };
      console.log('❌ Login endpoint failed:', error.message);
    }
  }

  // Test 3: Doctors endpoint
  try {
    console.log('👨‍⚕️ Testing doctors endpoint...');
    await axios.get(`${baseUrl}/doctors`, { timeout: 5000 });
    results.tests.doctorsEndpoint = {
      status: 'success',
      message: 'Doctors endpoint responds',
    };
    console.log('✅ Doctors endpoint responds');
  } catch (error) {
    if (error.response?.status === 401) {
      results.tests.doctorsEndpoint = {
        status: 'partial',
        message: 'Doctors endpoint requires authentication',
      };
      console.log('⚠️  Doctors endpoint requires auth (normal)');
    } else {
      results.tests.doctorsEndpoint = {
        status: 'failed',
        message: error.message,
        errorCode: error.code,
      };
      console.log('❌ Doctors endpoint failed:', error.message);
    }
  }

  return results;
};

export const getConnectionDiagnostics = () => {
  return {
    message: `
🔧 NETWORK DIAGNOSTICS

If login is stuck or pages show loading spinner:

1. Check Backend Status:
   - Backend must be running: npm start (in backend folder)
   - Must see: "Server running on port 5000"

2. Check Network Configuration:
   - Current URL: ${require('./constants').BASE_URL}
   - Verify this IP is correct for your setup

3. Common Issues:
   ❌ "Network Error" → Backend not running
   ❌ "Request timeout" → Wrong IP or firewall blocking
   ❌ "401 Unauthorized" → Token validation failed (check backend)

4. To Debug:
   - Check console logs (press 'j' in Expo terminal)
   - Look for: [AUTH], [AXIOS], [NETWORK] logs
   - Run: testNetworkConnectivity(baseUrl)

5. Test Your Setup:
   - Device must be on SAME network as backend machine
   - Use: ipconfig (Windows) to find backend IP
   - Use: 10.0.2.2 for Android Emulator (not 127.0.0.1)
    `,
  };
};

export const isNetworkAvailable = async () => {
  try {
    const response = await axios.get('http://8.8.8.8:53', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
};
