const { Client } = require('pg');

async function testConnection() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres', // connect to default
        password: 'password',
        port: 5434,
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully to Docker PostgreSQL on 5433!');
        const res = await client.query('SELECT current_database();');
        console.log('Current DB:', res.rows[0].current_database);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

testConnection();
