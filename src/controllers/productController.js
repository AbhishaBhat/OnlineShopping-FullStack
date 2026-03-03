const db = require('../config/db');

async function listProducts(req, res) {
  try {
    const { q, limit: reqLimit } = req.query;
    const limit = Math.min(50, parseInt(reqLimit) || 12);

    let query = 'SELECT product_id AS id, product_name AS name, description, price, stock, category_id, image_url, created_at FROM products';
    const params = [];

    if (q && q.trim()) {
      const searchTerms = `%${q.trim()}%`;
      query += ' WHERE product_name LIKE ? OR description LIKE ?';
      params.push(searchTerms, searchTerms);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await db.query(query, params);
    return res.json({ ok: true, products: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function getProduct(req, res) {
  try {
    const id = req.params.id;
    const [rows] = await db.query('SELECT product_id AS id, product_name AS name, description, price, stock, category_id, image_url, created_at FROM products WHERE product_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, product: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = { listProducts, getProduct };