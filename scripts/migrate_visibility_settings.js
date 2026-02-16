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
        console.log('Adding visibility columns to cms_site_settings...');

        const [columns] = await connection.query('SHOW COLUMNS FROM cms_site_settings');
        const columnNames = columns.map(c => c.Field);

        const newColumns = [
            'show_home_slider',
            'show_features',
            'show_personnel',
            'show_courses',
            'show_news',
            'show_about'
        ];

        for (const col of newColumns) {
            if (!columnNames.includes(col)) {
                console.log(`Adding column: ${col}`);
                await connection.query(`ALTER TABLE cms_site_settings ADD COLUMN ${col} TINYINT(1) DEFAULT 1`);
            } else {
                console.log(`Column ${col} already exists.`);
            }
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
