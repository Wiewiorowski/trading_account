
import fs from 'fs';
import path from 'path';
import pool from '../db';

async function migrate() {
    try {
        const schemaPath = path.join(__dirname, '../models/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');
        await pool.query(schemaSql);
        console.log('✅ Schema applied successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
