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

    async function repairTable(tableName, colName) {
        console.log(`\n--- Repairing ${tableName}.${colName} ---`);
        const [rows] = await connection.execute(`SELECT id, ${colName} FROM ${tableName}`);

        let fixedCount = 0;

        for (const row of rows) {
            const dbPath = row[colName];
            if (!dbPath || !dbPath.includes('uploads/')) continue;

            const filename = dbPath.split('/').pop();

            if (fs.existsSync(path.join(uploadDir, filename))) {
                continue; // Already correct
            }

            // Try to find by suffix
            const parts = filename.split('-');
            if (parts.length >= 3) {
                const suffix = parts.slice(2).join('-');
                const match = filesOnDisk.find(f => f.endsWith(suffix));
                if (match) {
                    const newPath = `/web/uploads/${match}`;
                    console.log(`UPDATING: [ID ${row.id}] ${filename} -> ${match}`);
                    await connection.execute(`UPDATE ${tableName} SET ${colName} = ? WHERE id = ?`, [newPath, row.id]);
                    fixedCount++;
                }
            }
        }
        console.log(`Summary for ${tableName}: Fixed ${fixedCount} records.`);
    }

    async function repairPages() {
        console.log(`\n--- Repairing cms_pages content ---`);
        const [pages] = await connection.execute(`SELECT id, content FROM cms_pages`);
        let fixedCount = 0;

        for (const page of pages) {
            if (!page.content) continue;
            let currentContent = page.content;
            let modified = false;

            // Regex for src="/web/uploads/..." or src="/uploads/..."
            const regex = /src=["']((?:\/web)?\/uploads\/([^"']+))["']/g;
            let match;

            const replacements = [];

            while ((match = regex.exec(page.content)) !== null) {
                const fullPath = match[1];
                const filename = match[2];

                if (!fs.existsSync(path.join(uploadDir, filename))) {
                    // Find by suffix
                    const parts = filename.split('-');
                    if (parts.length >= 3) {
                        const suffix = parts.slice(2).join('-');
                        const fileMatch = filesOnDisk.find(f => f.endsWith(suffix));
                        if (fileMatch) {
                            replacements.push({ old: fullPath, new: `/web/uploads/${fileMatch}` });
                            modified = true;
                        }
                    }
                }
            }

            if (modified) {
                for (const rep of replacements) {
                    currentContent = currentContent.split(rep.old).join(rep.new);
                    console.log(`PAGES FIX: ${rep.old} -> ${rep.new}`);
                }
                await connection.execute(`UPDATE cms_pages SET content = ? WHERE id = ?`, [currentContent, page.id]);
                fixedCount++;
            }
        }
        console.log(`Summary for cms_pages: Fixed ${fixedCount} pages.`);
    }

    try {
        await repairTable('cms_personnel', 'image');
        await repairTable('cms_news', 'image');
        await repairTable('cms_hero', 'bg_image');
        await repairPages();
        console.log('\nRepair complete!');
    } catch (e) {
        console.error('Repair failed:', e);
    } finally {
        await connection.end();
    }
}

run();
