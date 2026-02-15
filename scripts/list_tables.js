const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
    // 1. Read .env.local manually
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('.env.local not found');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envConfig = {};
    envContent.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envConfig[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    });

    const connection = await mysql.createConnection({
        host: envConfig.DB_HOST,
        user: envConfig.DB_USER,
        password: envConfig.DB_PASSWORD,
        database: envConfig.DB_NAME,
        port: parseInt(envConfig.DB_PORT || '3306')
    });

    try {
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('--- TABLES ---');
        console.log(JSON.stringify(rows.map(row => Object.values(row)[0]), null, 2));

        console.log('\n--- CMS_NEWS SCHEMA ---');
        try {
            const [columns] = await connection.execute('DESCRIBE cms_news');
            console.log(JSON.stringify(columns, null, 2));

            const cols = columns.map(c => c.Field);
            const thumbCol = cols.includes('thumbnail') ? 'thumbnail' : (cols.includes('image') ? 'image' : null);

            if (thumbCol) {
                const [news] = await connection.execute(`SELECT title, ${thumbCol} FROM cms_news LIMIT 5`);
                console.log('\n--- SAMPLE NEWS DATA ---');
                console.log(JSON.stringify(news, null, 2));
            } else {
                const [news] = await connection.execute(`SELECT * FROM cms_news LIMIT 2`);
                console.log('\n--- SAMPLE NEWS DATA (ALL COLS) ---');
                console.log(JSON.stringify(news, null, 2));
            }
        } catch (e) { console.log('cms_news table error:', e.message); }

        console.log('\n--- HERO DATA ---');
        try {
            const [columns] = await connection.execute('DESCRIBE cms_hero');
            const cols = columns.map(c => c.Field);
            const imgCol = cols.find(c => c.toLowerCase().includes('image') || c.toLowerCase().includes('url'));
            if (imgCol) {
                const [hero] = await connection.execute(`SELECT id, ${imgCol} FROM cms_hero`);
                console.log(JSON.stringify(hero, null, 2));
            } else {
                const [hero] = await connection.execute('SELECT * FROM cms_hero');
                console.log(JSON.stringify(hero, null, 2));
            }
        } catch (e) { console.log('cms_hero error:', e.message); }

        console.log('\n--- DEPARTMENTS DATA ---');
        try {
            const [columns] = await connection.execute('DESCRIBE cms_departments');
            const cols = columns.map(c => c.Field);
            const nameCol = cols.find(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('title'));
            const imgCol = cols.find(c => c.toLowerCase().includes('image') || c.toLowerCase().includes('url') || c.toLowerCase().includes('thumbnail'));

            let query = 'SELECT id';
            if (nameCol) query += `, ${nameCol}`;
            if (imgCol) query += `, ${imgCol}`;
            query += ' FROM cms_departments';

            const [dept] = await connection.execute(query);
            console.log(JSON.stringify(dept, null, 2));
        } catch (e) { console.log('cms_departments error:', e.message); }

        console.log('\n--- PERSONNEL DATA ---');
        try {
            const [personnel] = await connection.execute('SELECT name, image FROM cms_personnel');
            console.log(JSON.stringify(personnel, null, 2));
        } catch (e) { console.log('cms_personnel error:', e.message); }

        console.log('\n--- PAGES CONTENT ---');
        try {
            const [pages] = await connection.execute('SELECT title, slug, content FROM cms_pages');
            pages.forEach(p => {
                const matches = p.content ? p.content.match(/src="([^"]+)"/g) : null;
                if (matches) {
                    console.log(`Page: ${p.title} (${p.slug}) has images:`, matches);
                }
            });
        } catch (e) { console.log('cms_pages error or does not exist'); }

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

run();
