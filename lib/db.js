import mysql from 'mysql2/promise';
// Ensure mysql2 is used as a server-only package

let pool = global.dbPool || null;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '3306'),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 30000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            charset: 'utf8mb4',
        });
        global.dbPool = pool;
    }
    return pool;
}

export async function query(sql, params = []) {
    const pool = getPool();
    const [rows] = await pool.query(sql, params);
    return rows;
}

export default getPool;
