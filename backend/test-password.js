const mysql = require('mysql2/promise');

// Test different password combinations
const passwordsToTry = [
    'root123',
    '',
    'password',
    'admin',
    'mysql',
    'root'
];

async function testConnection(password) {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: password
        });

        console.log(`✅ SUCCESS! Password is: "${password}"`);
        await connection.end();
        return true;
    } catch (error) {
        console.log(`❌ Failed with password: "${password}"`);
        return false;
    }
}

async function findPassword() {
    console.log('🔍 Testing MySQL passwords...\n');

    for (const pwd of passwordsToTry) {
        const success = await testConnection(pwd);
        if (success) {
            console.log(`\n🎉 Found working password: "${pwd}"`);
            console.log(`\nUpdate line 7 in db.js to:`);
            console.log(`password: '${pwd}',`);
            return;
        }
    }

    console.log('\n❌ None of the common passwords worked.');
    console.log('Please check your MySQL installation or try resetting the password.');
}

findPassword();
