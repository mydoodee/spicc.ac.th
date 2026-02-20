const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) acc[match[1].trim()] = match[2].trim();
        return acc;
    }, {});

async function setupAbout() {
    const connection = await mysql.createConnection({
        host: envConfig.DB_HOST,
        user: envConfig.DB_USER,
        password: envConfig.DB_PASSWORD,
        database: envConfig.DB_NAME,
        port: parseInt(envConfig.DB_PORT || '3306')
    });

    console.log('Connected to database.');

    try {
        // Create cms_about table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS cms_about (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle VARCHAR(255),
                description TEXT,
                stats JSON,
                features JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table cms_about created/verified.');

        // Initial Data
        const initialStats = JSON.stringify([
            { label: 'ปีประสบการณ์', value: '25+' },
            { label: 'คณาจารย์', value: '100+' },
            { label: 'นักศึกษา', value: '5K+' }
        ]);

        const initialFeatures = JSON.stringify([
            {
                icon: "verified",
                title: "มาตรฐานระดับสากล",
                description: "หลักสูตรที่ได้รับการรับรองจากองค์กรชั้นนำ"
            },
            {
                icon: "psychology",
                title: "นวัตกรรมการเรียนรู้",
                description: "เทคโนโลยีและวิธีการสอนที่ทันสมัย"
            },
            {
                icon: "groups",
                title: "ชุมชนที่แข็งแกร่ง",
                description: "เครือข่ายศิษย์เก่าและพันธมิตรทั่วโลก"
            }
        ]);

        const title = 'มุ่งมั่นสู่ความเป็นเลิศ';
        const subtitle = 'เกี่ยวกับเรา';
        const description = 'Premium College ก่อตั้งขึ้นด้วยวิสัยทัศน์ที่ต้องการสร้างสภาพแวดล้อมการเรียนรู้ที่ทันสมัยและมีคุณภาพระดับสากล เราเชื่อว่าการศึกษาคือรากฐานสำคัญของการพัฒนาตนเองและสังคม';

        // Insert default data if empty
        const [rows] = await connection.execute('SELECT id FROM cms_about LIMIT 1');
        if (rows.length === 0) {
            await connection.execute(
                'INSERT INTO cms_about (title, subtitle, description, stats, features) VALUES (?, ?, ?, ?, ?)',
                [title, subtitle, description, initialStats, initialFeatures]
            );
            console.log('Default About data inserted.');
        } else {
            console.log('About data already exists, skipping insert.');
        }

    } catch (error) {
        console.error('Error setting up About:', error);
    } finally {
        await connection.end();
    }
}

setupAbout();
