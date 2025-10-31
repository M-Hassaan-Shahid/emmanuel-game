// Quick CORS test script
const fetch = require('node-fetch');

async function testCORS() {
    console.log('========================================');
    console.log('Testing CORS Configuration');
    console.log('========================================\n');

    try {
        console.log('Testing: http://localhost:8000/api/login');
        console.log('Origin: http://localhost:3000\n');

        const response = await fetch('http://localhost:8000/api/login', {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('\nResponse Headers:');

        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
            console.log(`  ${key}: ${value}`);
        });

        if (headers['access-control-allow-origin']) {
            console.log('\n✅ CORS is configured correctly!');
            console.log('Allowed Origin:', headers['access-control-allow-origin']);
        } else {
            console.log('\n❌ CORS is NOT configured correctly!');
            console.log('Missing Access-Control-Allow-Origin header');
        }

    } catch (error) {
        console.error('\n❌ Error testing CORS:', error.message);
        console.log('\nMake sure backend is running on port 8000');
    }
}

testCORS();
