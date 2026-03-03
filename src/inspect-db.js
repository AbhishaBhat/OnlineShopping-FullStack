const db = require('./config/db');

const tables = [
  'users','categories','products','cart','wishlist',
  'orders','order_items','payments','user_history',
  'admin_activity','admin_permissions'
];

(async () => {
  try {
    for (const t of tables) {
      console.log('--- TABLE:', t, '---');
      // columns
      const [cols] = await db.query(
        `SELECT COLUMN_NAME, DATA_TYPE 
         FROM information_schema.columns 
         WHERE table_schema = DATABASE() AND table_name = ? 
         ORDER BY ORDINAL_POSITION`, [t]
      );
      if (!cols.length) {
        console.log('  (table not found or empty column list)');
        continue;
      }
      cols.forEach(c => console.log('  ', c.COLUMN_NAME, c.DATA_TYPE));
      // sample row
      try {
        const [rows] = await db.query(`SELECT * FROM \`${t}\` LIMIT 1`);
        console.log('  sample row:', rows.length ? JSON.stringify(rows[0], null, 2) : '(no rows)');
      } catch (err) {
        console.log('  sample row: ERROR (maybe table empty or restricted):', err.message);
      }
      console.log('');
    }
    process.exit(0);
  } catch (err) {
    console.error('Inspect error:', err.message);
    process.exit(1);
  }
})();