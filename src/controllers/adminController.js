const db = require('../config/db');
const { addAdminActivity } = require('../utils/history');

async function dashboard(req, res) {
  try {
    const [uRows] = await db.query('SELECT COUNT(*) as count FROM users');
    const [pRows] = await db.query('SELECT COUNT(*) as count FROM products');
    const [oRows] = await db.query('SELECT COUNT(*) as count FROM orders');
    const [cRows] = await db.query('SELECT COUNT(*) as count FROM categories');

    return res.json({
      ok: true,
      stats: {
        users: uRows[0] ? uRows[0].count : 0,
        products: pRows[0] ? pRows[0].count : 0,
        orders: oRows[0] ? oRows[0].count : 0,
        categories: cRows[0] ? cRows[0].count : 0
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function addCategory(req, res) {
  try {
    const { name, description } = req.body;
    const [r] = await db.query('INSERT INTO categories (category_name, description, created_at) VALUES (?, ?, NOW())', [name, description]);
    await addAdminActivity(req.user.user_id, 'add_category', { id: r.insertId, name });
    return res.json({ ok: true, id: r.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function updateCategory(req, res) {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    await db.query('UPDATE categories SET category_name=?, description=? WHERE category_id=?', [name, description, id]);
    await addAdminActivity(req.user.user_id, 'edit_category', { id, name });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function deleteCategory(req, res) {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM categories WHERE category_id = ?', [id]);
    await addAdminActivity(req.user.user_id, 'delete_category', { id });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function getPermissions(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM admin_permissions WHERE user_id = ?', [req.user.user_id]);
    return res.json({ ok: true, permissions: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function getActivity(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM admin_activity ORDER BY action_time DESC LIMIT 500');
    return res.json({ ok: true, activity: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = { dashboard, addCategory, updateCategory, deleteCategory, getPermissions, getActivity };