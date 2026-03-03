require('dotenv').config(); // must run before reading process.env
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Abhi@123',
  database: process.env.DB_NAME || 'online_shop',
  waitForConnections: true,
  connectionLimit: 10
});

(async function test() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('MySQL pool connected to', process.env.DB_NAME || 'online_shop');
  } catch (err) {
    console.error('MySQL connection failed:', err && (err.stack || err.message || err));
  }
})();

module.exports = pool;
