const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('========================================');
console.log('Password Hash Generator');
console.log('========================================\n');

rl.question('Enter password to hash: ', (password) => {
    if (!password) {
        console.log('❌ Password cannot be empty!');
        rl.close();
        return;
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('❌ Error hashing password:', err);
            rl.close();
            return;
        }

        console.log('\n✅ Password hashed successfully!');
        console.log('================================');
        console.log('Original Password:', password);
        console.log('Hashed Password:', hash);
        console.log('================================\n');
        console.log('Copy the hashed password to use in your database.');

        rl.close();
    });
});
