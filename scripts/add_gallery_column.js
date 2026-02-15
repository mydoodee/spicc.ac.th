const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                value = value.replace(/^"|"$/g, '');
            }
            process.env[key] = value;
        }
    });
}

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('Checking database schema...');

    try {
        const [rows] = await connection.execute('SHOW COLUMNS FROM cms_pages LIKE "gallery"');
        if (rows.length === 0) {
            console.log('Adding "gallery" column to "cms_pages" table...');
            await connection.execute('ALTER TABLE cms_pages ADD COLUMN gallery LONGTEXT');
            console.log('Column added successfully.');
        } else {
            console.log('"gallery" column already exists.');
        }
    } catch (error) {
        console.error('Error updating database:', error);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
