const db = require('../config/db');

async function listCategories(req, res) {
  try {
    const [rows] = await db.query('SELECT category_id AS id, category_name AS name, description FROM categories ORDER BY category_name');
    return res.json({ ok: true, categories: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function productsByCategory(req, res) {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (!categoryId) return res.status(400).json({ ok: false, message: 'Invalid category id' });

    const [rows] = await db.query(
      `SELECT product_id AS id, product_name AS name, description, price, stock, category_id, image_url
       FROM products WHERE category_id = ? ORDER BY created_at DESC`,
      [categoryId]
    );
    return res.json({ ok: true, products: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = { listCategories, productsByCategory };