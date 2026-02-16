const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
        console.log('Adding show_procurement column to cms_site_settings...');

        const [columns] = await connection.query('SHOW COLUMNS FROM cms_site_settings');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('show_procurement')) {
            console.log('Adding column: show_procurement');
            await connection.query('ALTER TABLE cms_site_settings ADD COLUMN show_procurement TINYINT(1) DEFAULT 1');
        } else {
            console.log('Column show_procurement already exists.');
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
