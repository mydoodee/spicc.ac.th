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

        console.log("Loaded config for:", envConfig.DB_NAME ? envConfig.DB_NAME : "UNKNOWN DB");

        // 2. Connect to DB
        console.log(`Connecting to database ${envConfig.DB_NAME} at ${envConfig.DB_HOST}...`);
        const connection = await mysql.createConnection({
            host: envConfig.DB_HOST,
            user: envConfig.DB_USER,
            password: envConfig.DB_PASSWORD,
            database: envConfig.DB_NAME,
            port: parseInt(envConfig.DB_PORT || '3306')
        });

        // 3. Run Query
        console.log("Attempting to add 'target' column to cms_menus...");
        try {
            await connection.execute("ALTER TABLE cms_menus ADD COLUMN target VARCHAR(20) DEFAULT '_self' AFTER url");
            console.log("Column 'target' added successfully.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("Column 'target' already exists.");
            } else {
                console.error("Error executing query:", e.message);
            }
        }

        await connection.end();
        console.log("Done.");

    } catch (e) {
        console.error("Script failed:", e);
    }
}

run();
