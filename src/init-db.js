const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');

        const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
        const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        // Split SQL by semicolon, but be careful with triggers or procedures if any
        // For this project, simple splitting should work as there are no complex structures in schema.sql
        const schemaStatements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const seedStatements = seedSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log('Executing schema...');
        // We need to disable foreign key checks because of DROP TABLE order if not perfect
        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        for (const statement of schemaStatements) {
            await db.query(statement);
        }

        console.log('Executing seed data...');
        for (const statement of seedStatements) {
            await db.query(statement);
        }

        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Database initialization completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Database initialization failed:', err);
        process.exit(1);
    }
}

initializeDatabase();
