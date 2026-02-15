const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envConfig = {};
    envContent.split(/\r?\n/).forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) envConfig[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    });

    const connection = await mysql.createConnection({
        host: envConfig.DB_HOST,
        user: envConfig.DB_USER,
        password: envConfig.DB_PASSWORD,
        database: envConfig.DB_NAME,
        port: parseInt(envConfig.DB_PORT || '3306')
    });

    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    const filesOnDisk = fs.readdirSync(uploadDir);

    async function checkTable(tableName, colName) {
        console.log(`\n--- Checking ${tableName}.${colName} ---`);
        const [rows] = await connection.execute(`SELECT id, ${colName} FROM ${tableName} WHERE ${colName} LIKE '/web/uploads/%'`);

        let fixed = 0;
        let missing = 0;

        for (const row of rows) {
            const dbPath = row[colName];
            const filename = dbPath.split('/').pop();

            if (fs.existsSync(path.join(uploadDir, filename))) {
                // File exists, no action needed
            } else {
                // Missing. Try to find by suffix
                const parts = filename.split('-');
                if (parts.length >= 3) {
                    const suffix = parts.slice(2).join('-');
                    const match = filesOnDisk.find(f => f.endsWith(suffix));
                    if (match) {
                        console.log(`MATCH FOUND: [ID ${row.id}] ${filename} -> ${match}`);
                        fixed++;
                    } else {
                        console.log(`NOT FOUND: [ID ${row.id}] ${filename}`);
                        missing++;
                    }
                }
            }
        }
        console.log(`Summary for ${tableName}: Found ${fixed} matches, ${missing} still missing.`);
    }

    try {
        await checkTable('cms_personnel', 'image');
        await checkTable('cms_news', 'image');
        // Add pages if needed, but pages are in longtext content
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

run();
