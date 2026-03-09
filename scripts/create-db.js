const { Client } = require('pg');

async function createDatabase() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres', // Connect to default postgres DB first
        password: 'password',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL (default DB)');

        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'resumebuilder'");
        if (res.rowCount === 0) {
            console.log('Creating database "resumebuilder"...');
            await client.query('CREATE DATABASE resumebuilder');
            console.log('Database "resumebuilder" created successfully.');
        } else {
            console.log('Database "resumebuilder" already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err.message);
        if (err.message.includes('authentication failed')) {
            console.log('Tip: Check if the password "password" is correct for the "postgres" user.');
        }
    } finally {
        await client.end();
    }
}

createDatabase();
