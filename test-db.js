const fs = require('fs');
const mysql = require('mysql2/promise');

async function testDB() {
    try {
        // Parse .env.local manually
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) env[match[1].trim()] = match[2].trim();
        });

        const connection = await mysql.createConnection({
            host: env.DB_HOST,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            port: parseInt(env.DB_PORT || '3306'),
        });

        console.log('Connected to DB successfully');

        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('Tables:', tableNames);

        if (tableNames.includes('cms_courses')) {
            const [columns] = await connection.execute('SHOW COLUMNS FROM cms_courses');
            console.log('cms_courses columns:', columns.map(c => c.Field));
        } else {
            console.log('cms_courses table is MISSING');
        }

        if (tableNames.includes('cms_courses_settings')) {
            const [columns] = await connection.execute('SHOW COLUMNS FROM cms_courses_settings');
            console.log('cms_courses_settings columns:', columns.map(c => c.Field));
        } else {
            console.log('cms_courses_settings table is MISSING');
        }

        await connection.end();
    } catch (error) {
        console.error('DB Connection Failed:', error);
        console.log('Manual check: Make sure your DB credentials in .env.local are correct.');
    }
}

testDB();
