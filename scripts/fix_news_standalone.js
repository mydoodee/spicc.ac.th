const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
    try {
        // 1. Read .env.local manually
        const envPath = path.join(__dirname, '..', '.env.local');
        console.log("Reading .env.local from:", envPath);

        if (!fs.existsSync(envPath)) {
            console.error('.env.local not found at:', envPath);
            process.exit(1);
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const envConfig = {};

        envContent.split(/\r?\n/).forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return; // Skip empty lines and comments

            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();

                // Remove surrounding quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                envConfig[key] = value;
            }
        });

        // 2. Connect to DB
        console.log(`Connecting to database ${envConfig.DB_NAME}...`);
        const connection = await mysql.createConnection({
            host: envConfig.DB_HOST,
            user: envConfig.DB_USER,
            password: envConfig.DB_PASSWORD,
            database: envConfig.DB_NAME,
            port: parseInt(envConfig.DB_PORT || '3306')
        });

        // 3. Fix News
        console.log("Updating old featured news (IDs 1, 2, 3) to general...");
        const [result] = await connection.execute("UPDATE cms_news SET is_featured = 0 WHERE id IN (1, 2, 3)");
        console.log(`Changed ${result.changedRows} rows.`);

        const [rows] = await connection.execute("SELECT COUNT(*) as count FROM cms_news WHERE is_featured = 0");
        console.log(`Total General News now: ${rows[0].count}`);

        await connection.end();

    } catch (e) {
        console.error("Script failed:", e);
    }
}

run();
