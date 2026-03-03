const db = require('../config/db');

async function addUserHistory(user_id, action) {
  try {
    await db.query(
      'INSERT INTO user_history (user_id, action, action_time) VALUES (?, ?, NOW())',
      [user_id, action]
    );
  } catch (err) {
    console.error('user_history error', err);
  }
}

async function addAdminActivity(admin_id, action, meta) {
  try {
    await db.query(
      'INSERT INTO admin_activity (admin_id, action, details, action_time) VALUES (?, ?, ?, NOW())',
      [admin_id, action, meta ? JSON.stringify(meta) : null]
    );
  } catch (err) {
    console.error('admin_activity error', err);
  }
}

module.exports = { addUserHistory, addAdminActivity };