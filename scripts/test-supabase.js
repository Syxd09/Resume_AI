const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testSupabase() {
    const logPath = path.join(__dirname, 'test-results.log');
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logPath, msg + '\n');
    };

    fs.writeFileSync(logPath, '--- Connection Test Log ---\n');

    const connections = [
        {
            name: 'Direct (5432)',
            connectionString: `postgresql://postgres:Mh%2C%237619365978@db.jrxocybrmjsaptaflmzh.supabase.co:5432/postgres`
        },
        {
            name: 'Pooler (6543)',
            connectionString: `postgresql://postgres.jrxocybrmjsaptaflmzh:Mh%2C%237619365978@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
        }
    ];

    for (const conn of connections) {
        log(`\nTesting: ${conn.name}`);
        const client = new Client({
            connectionString: conn.name === 'Direct (5432)' ? conn.connectionString : conn.connectionString,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000 // 10s timeout
        });

        const start = Date.now();
        try {
            await client.connect();
            log(`✅ SUCCESS in ${Date.now() - start}ms!`);
            const res = await client.query('SELECT current_user, current_database();');
            log(`User: ${res.rows[0].current_user}`);
            log(`Database: ${res.rows[0].current_database}`);
            await client.end();
            break; // Stop if we find a working one
        } catch (err) {
            log(`❌ FAILED in ${Date.now() - start}ms: ${err.message}`);
        }
    }
}

testSupabase();
