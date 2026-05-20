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
      `SELECT p.product_id AS id, p.product_name AS name, p.description, p.price, p.stock,
              p.category_id, p.image_url, p.created_at,
              COALESCE(ROUND(AVG(pr.rating), 1), 0) AS avg_rating,
              COUNT(pr.review_id) AS review_count
       FROM products p
       LEFT JOIN product_reviews pr ON pr.product_id = p.product_id
       WHERE p.category_id = ?
       GROUP BY p.product_id, p.product_name, p.description, p.price, p.stock,
                p.category_id, p.image_url, p.created_at
       ORDER BY p.created_at DESC`,
      [categoryId]
    );
    return res.json({ ok: true, products: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = { listCategories, productsByCategory };
