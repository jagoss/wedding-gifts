/**
 * Automated API Test Runner
 * 
 * Runs all API endpoints sequentially and reports results.
 * Automatically extracts tokens, IDs, and uses them in subsequent requests.
 * 
 * Usage: node run-api-tests.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:8080';
const TIMEOUT = 5000;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Test state
const state = {
  accessToken: null,
  userId: null,
  weddingId: null,
  weddingSlug: 'juan-y-ana-2026',
  giftId: null,
  contributionId: null,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
};

// Helper: Make HTTP request
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: defaultHeaders,
      timeout: TIMEOUT,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let parsedData = null;
        try {
          parsedData = data ? JSON.parse(data) : null;
        } catch (e) {
          parsedData = data;
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedData,
          rawBody: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Helper: Log test result
function logTest(testName, expectedStatus, actualStatus, passed, response = null) {
  state.totalTests++;
  
  if (passed) {
    state.passedTests++;
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    console.log(`  ${colors.gray}Expected: ${expectedStatus}, Got: ${actualStatus}${colors.reset}`);
  } else {
    state.failedTests++;
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    console.log(`  ${colors.red}Expected: ${expectedStatus}, Got: ${actualStatus}${colors.reset}`);
    if (response) {
      console.log(`  ${colors.gray}Response: ${JSON.stringify(response.body)}${colors.reset}`);
    }
  }
}

// Helper: Section header
function logSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

// Helper: Subsection
function logSubsection(title) {
  console.log(`\n${colors.blue}${title}${colors.reset}`);
}

// Test runner
async function runTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║          Wedding Gift Registry - API Test Suite              ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    // ============================================
    // AUTHENTICATION TESTS
    // ============================================
    logSection('1. AUTHENTICATION ENDPOINTS');

    // Register User - Success
    logSubsection('Register New User');
    let response = await makeRequest('POST', '/auth/register', {
      name: 'Juan Perez',
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePassword123!',
    });
    logTest('Register User - Success', 201, response.statusCode, response.statusCode === 201, response);
    if (response.body && response.body.id) {
      state.userId = response.body.id;
    }

    // Register User - Validation Error
    response = await makeRequest('POST', '/auth/register', {
      name: 'Juan Perez',
    });
    logTest('Register User - Missing Fields', 400, response.statusCode, response.statusCode === 400, response);

    // Login - Success
    logSubsection('Login User');
    response = await makeRequest('POST', '/auth/login', {
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePassword123!',
    });
    
    // Need to register first for login to work
    const testEmail = `test-${Date.now()}@example.com`;
    await makeRequest('POST', '/auth/register', {
      name: 'Test User',
      email: testEmail,
      password: 'TestPassword123!',
    });
    
    response = await makeRequest('POST', '/auth/login', {
      email: testEmail,
      password: 'TestPassword123!',
    });
    logTest('Login - Success', 200, response.statusCode, response.statusCode === 200, response);
    if (response.body && response.body.accessToken) {
      state.accessToken = response.body.accessToken;
      console.log(`  ${colors.green}→ Access token obtained${colors.reset}`);
    }

    // Login - Invalid Credentials
    response = await makeRequest('POST', '/auth/login', {
      email: testEmail,
      password: 'WrongPassword',
    });
    logTest('Login - Invalid Credentials', 401, response.statusCode, response.statusCode === 401, response);

    // ============================================
    // WEDDING MANAGEMENT TESTS
    // ============================================
    logSection('2. WEDDING MANAGEMENT (AUTHENTICATED)');

    if (!state.accessToken) {
      console.log(`${colors.red}⚠ Skipping wedding tests - no access token${colors.reset}`);
    } else {
      // Get User Weddings
      logSubsection('List User Weddings');
      response = await makeRequest('GET', '/weddings/me', null, {
        Authorization: `Bearer ${state.accessToken}`,
      });
      logTest('Get User Weddings - Success', 200, response.statusCode, response.statusCode === 200, response);

      // Get User Weddings - Unauthorized
      response = await makeRequest('GET', '/weddings/me');
      logTest('Get User Weddings - Unauthorized', 401, response.statusCode, response.statusCode === 401, response);

      // Create Wedding - Success
      logSubsection('Create Wedding');
      const uniqueSlug = `wedding-${Date.now()}`;
      response = await makeRequest('POST', '/weddings', {
        title: 'Test Wedding',
        slug: uniqueSlug,
        date: '2026-06-15',
        location: 'Test Location',
        message: 'Test message',
      }, {
        Authorization: `Bearer ${state.accessToken}`,
      });
      logTest('Create Wedding - Success', 201, response.statusCode, response.statusCode === 201, response);
      if (response.body && response.body.id) {
        state.weddingId = response.body.id;
        state.weddingSlug = response.body.slug || uniqueSlug;
        console.log(`  ${colors.green}→ Wedding ID: ${state.weddingId}${colors.reset}`);
        console.log(`  ${colors.green}→ Wedding Slug: ${state.weddingSlug}${colors.reset}`);
      }

      // Create Wedding - Duplicate Slug
      response = await makeRequest('POST', '/weddings', {
        title: 'Another Wedding',
        slug: uniqueSlug,
      }, {
        Authorization: `Bearer ${state.accessToken}`,
      });
      logTest('Create Wedding - Duplicate Slug', 409, response.statusCode, response.statusCode === 409, response);

      // Create Wedding - Unauthorized
      response = await makeRequest('POST', '/weddings', {
        title: 'Unauthorized Wedding',
        slug: `wedding-${Date.now()}`,
      });
      logTest('Create Wedding - Unauthorized', 401, response.statusCode, response.statusCode === 401, response);

      if (state.weddingId) {
        // Get Wedding Details
        logSubsection('Get Wedding Details');
        response = await makeRequest('GET', `/weddings/${state.weddingId}`, null, {
          Authorization: `Bearer ${state.accessToken}`,
        });
        logTest('Get Wedding - Success', 200, response.statusCode, response.statusCode === 200, response);

        // Get Wedding - Not Found
        response = await makeRequest('GET', '/weddings/wed_nonexistent', null, {
          Authorization: `Bearer ${state.accessToken}`,
        });
        logTest('Get Wedding - Not Found', 404, response.statusCode, response.statusCode === 404, response);

        // Update Wedding
        logSubsection('Update Wedding');
        response = await makeRequest('PATCH', `/weddings/${state.weddingId}`, {
          title: 'Updated Wedding Title',
          location: 'New Location',
        }, {
          Authorization: `Bearer ${state.accessToken}`,
        });
        logTest('Update Wedding - Success', 200, response.statusCode, response.statusCode === 200, response);
      }
    }

    // ============================================
    // PUBLIC WEDDING ACCESS
    // ============================================
    logSection('3. PUBLIC WEDDING ACCESS');

    if (state.weddingSlug) {
      response = await makeRequest('GET', `/public/weddings/${state.weddingSlug}`);
      logTest('Get Public Wedding - Success', 200, response.statusCode, response.statusCode === 200, response);
    }

    response = await makeRequest('GET', '/public/weddings/non-existent-slug');
    logTest('Get Public Wedding - Not Found', 404, response.statusCode, response.statusCode === 404, response);

    // ============================================
    // GIFT MANAGEMENT TESTS
    // ============================================
    logSection('4. GIFT MANAGEMENT (AUTHENTICATED)');

    if (!state.accessToken || !state.weddingId) {
      console.log(`${colors.red}⚠ Skipping gift tests - no access token or wedding ID${colors.reset}`);
    } else {
      // Get Wedding Gifts
      logSubsection('List Wedding Gifts');
      response = await makeRequest('GET', `/weddings/${state.weddingId}/gifts`, null, {
        Authorization: `Bearer ${state.accessToken}`,
      });
      logTest('Get Wedding Gifts - Success', 200, response.statusCode, response.statusCode === 200, response);

      // Get Wedding Gifts - Unauthorized
      response = await makeRequest('GET', `/weddings/${state.weddingId}/gifts`);
      logTest('Get Wedding Gifts - Unauthorized', 401, response.statusCode, response.statusCode === 401, response);

      // Create Gift - Product Type
      logSubsection('Create Gift');
      response = await makeRequest('POST', `/weddings/${state.weddingId}/gifts`, {
        title: 'Test Coffee Maker',
        description: 'Italian espresso maker',
        estimatedPrice: 15000,
        currency: 'ARS',
        type: 'PRODUCT',
      }, {
        Authorization: `Bearer ${state.accessToken}`,
      });
      logTest('Create Gift - Success', 201, response.statusCode, response.statusCode === 201, response);
      if (response.body && response.body.id) {
        state.giftId = response.body.id;
        console.log(`  ${colors.green}→ Gift ID: ${state.giftId}${colors.reset}`);
      }

      // Create Gift - Validation Error
      response = await makeRequest('POST', `/weddings/${state.weddingId}/gifts`, {
        description: 'Missing title and type',
      }, {
        Authorization: `Bearer ${state.accessToken}`,
      });
      logTest('Create Gift - Validation Error', 400, response.statusCode, response.statusCode === 400, response);

      if (state.giftId) {
        // Get Gift Details
        logSubsection('Get Gift Details');
        response = await makeRequest('GET', `/weddings/${state.weddingId}/gifts/${state.giftId}`, null, {
          Authorization: `Bearer ${state.accessToken}`,
        });
        logTest('Get Gift - Success', 200, response.statusCode, response.statusCode === 200, response);

        // Update Gift
        logSubsection('Update Gift');
        response = await makeRequest('PATCH', `/weddings/${state.weddingId}/gifts/${state.giftId}`, {
          title: 'Updated Coffee Maker',
          estimatedPrice: 18000,
        }, {
          Authorization: `Bearer ${state.accessToken}`,
        });
        logTest('Update Gift - Success', 200, response.statusCode, response.statusCode === 200, response);
      }
    }

    // ============================================
    // CONTRIBUTION TESTS
    // ============================================
    logSection('5. CONTRIBUTION MANAGEMENT');

    if (!state.weddingSlug || !state.giftId) {
      console.log(`${colors.red}⚠ Skipping contribution tests - no wedding slug or gift ID${colors.reset}`);
    } else {
      // Create Public Contribution
      logSubsection('Create Public Contribution');
      response = await makeRequest('POST', `/public/weddings/${state.weddingSlug}/contributions`, {
        giftId: state.giftId,
        guestName: 'María González',
        guestEmail: 'maria.gonzalez@example.com',
        type: 'CONTRIBUTION',
        amount: 5000,
        paymentMethod: 'MERCADOPAGO',
      });
      logTest('Create Contribution - Success', 201, response.statusCode, response.statusCode === 201, response);
      if (response.body && response.body.contributionId) {
        state.contributionId = response.body.contributionId;
        console.log(`  ${colors.green}→ Contribution ID: ${state.contributionId}${colors.reset}`);
      }

      // Create Contribution - Validation Error
      response = await makeRequest('POST', `/public/weddings/${state.weddingSlug}/contributions`, {
        guestName: 'Pedro López',
      });
      logTest('Create Contribution - Validation Error', 400, response.statusCode, response.statusCode === 400, response);

      // Create Contribution - Wedding Not Found
      response = await makeRequest('POST', '/public/weddings/non-existent/contributions', {
        giftId: state.giftId,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        type: 'CONTRIBUTION',
        paymentMethod: 'MERCADOPAGO',
      });
      logTest('Create Contribution - Wedding Not Found', 404, response.statusCode, response.statusCode === 404, response);

      if (state.accessToken && state.weddingId) {
        // Get Wedding Contributions
        logSubsection('List Wedding Contributions');
        response = await makeRequest('GET', `/weddings/${state.weddingId}/contributions`, null, {
          Authorization: `Bearer ${state.accessToken}`,
        });
        logTest('Get Contributions - Success', 200, response.statusCode, response.statusCode === 200, response);

        // Get Contributions - Unauthorized
        response = await makeRequest('GET', `/weddings/${state.weddingId}/contributions`);
        logTest('Get Contributions - Unauthorized', 401, response.statusCode, response.statusCode === 401, response);
      }
    }

    // ============================================
    // PAYMENT INTEGRATION TESTS
    // ============================================
    logSection('6. PAYMENT INTEGRATION (MERCADOPAGO)');

    // Webhook - Payment Notification
    logSubsection('MercadoPago Webhooks');
    response = await makeRequest('POST', '/webhooks/mercadopago', {
      action: 'payment.created',
      data: { id: '12345678' },
      type: 'payment',
    });
    logTest('Webhook - Payment Notification', 200, response.statusCode, response.statusCode === 200, response);

    // Webhook - Invalid Payload
    response = await makeRequest('POST', '/webhooks/mercadopago', {
      type: 'payment',
    });
    logTest('Webhook - Invalid Payload', 400, response.statusCode, response.statusCode === 400, response);

    if (state.accessToken && state.weddingId && state.contributionId) {
      // Create Payment Preference
      logSubsection('Create Payment Preference');
      response = await makeRequest('POST', '/payments/mercadopago/preference', {
        weddingId: state.weddingId,
        contributionId: state.contributionId,
      }, {
        Authorization: `Bearer ${state.accessToken}`,
      });
      logTest('Create Payment Preference - Success', 200, response.statusCode, response.statusCode === 200, response);

      // Create Payment Preference - Missing Fields
      response = await makeRequest('POST', '/payments/mercadopago/preference', {
        weddingId: state.weddingId,
      }, {
        Authorization: `Bearer ${state.accessToken}`,
      });
      logTest('Create Payment Preference - Validation Error', 400, response.statusCode, response.statusCode === 400, response);
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.cyan}TEST SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
    
    console.log(`Total Tests: ${state.totalTests}`);
    console.log(`${colors.green}Passed: ${state.passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed: ${state.failedTests}${colors.reset}`);
    
    const passRate = ((state.passedTests / state.totalTests) * 100).toFixed(2);
    console.log(`\nPass Rate: ${passRate}%`);

    if (state.failedTests === 0) {
      console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`\n${colors.red}✗ Some tests failed${colors.reset}\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n${colors.red}Fatal Error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  console.log(`${colors.gray}Checking if API server is running on ${BASE_URL}...${colors.reset}`);
  try {
    await makeRequest('GET', '/');
    console.log(`${colors.green}✓ API server is running${colors.reset}\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ API server is not responding${colors.reset}`);
    console.log(`${colors.yellow}Please start the server with: cd apps/api && npm run dev${colors.reset}\n`);
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
})();

