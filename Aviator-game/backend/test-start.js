// Quick test to check if backend can start
require('dotenv').config();

console.log('========================================');
console.log('Testing Backend Configuration');
console.log('========================================');
console.log('');

// Check environment variables
console.log('✓ Checking environment variables...');
console.log('  PORT:', process.env.PORT || '8000 (default)');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('');

// Check required modules
console.log('✓ Checking required modules...');
try {
    require('express');
    console.log('  express: ✓');
} catch (e) {
    console.log('  express: ✗ Missing');
}

try {
    require('socket.io');
    console.log('  socket.io: ✓');
} catch (e) {
    console.log('  socket.io: ✗ Missing');
}

try {
    require('mongoose');
    console.log('  mongoose: ✓');
} catch (e) {
    console.log('  mongoose: ✗ Missing');
}

try {
    require('cors');
    console.log('  cors: ✓');
} catch (e) {
    console.log('  cors: ✗ Missing');
}

console.log('');
console.log('========================================');
console.log('Configuration check complete!');
console.log('========================================');
console.log('');
console.log('If all checks passed, run: npm start');
