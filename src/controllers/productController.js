const db = require('../config/db');

const productSelect = `
  SELECT p.product_id AS id, p.product_name AS name, p.description, p.price, p.stock,
         p.category_id, p.image_url, p.created_at,
         COALESCE(ROUND(AVG(pr.rating), 1), 0) AS avg_rating,
         COUNT(pr.review_id) AS review_count
  FROM products p
  LEFT JOIN product_reviews pr ON pr.product_id = p.product_id
`;

async function listProducts(req, res) {
  try {
    const { q, limit: reqLimit } = req.query;
    const limit = Math.min(50, parseInt(reqLimit) || 12);

    let query = productSelect;
    const params = [];

    if (q && q.trim()) {
      const searchTerms = `%${q.trim()}%`;
      query += ' WHERE p.product_name LIKE ? OR p.description LIKE ?';
      params.push(searchTerms, searchTerms);
    }

    query += ` GROUP BY p.product_id, p.product_name, p.description, p.price, p.stock,
                      p.category_id, p.image_url, p.created_at
               ORDER BY p.created_at DESC LIMIT ?`;
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
    const [rows] = await db.query(
      `${productSelect}
       WHERE p.product_id = ?
       GROUP BY p.product_id, p.product_name, p.description, p.price, p.stock,
                p.category_id, p.image_url, p.created_at`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, product: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function listProductReviews(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (!productId) return res.status(400).json({ ok: false, message: 'Invalid product id' });

    const [reviews] = await db.query(
      `SELECT pr.review_id AS id, pr.rating, pr.review_text, pr.created_at, pr.updated_at,
              u.full_name AS reviewer
       FROM product_reviews pr
       JOIN users u ON u.user_id = pr.user_id
       WHERE pr.product_id = ?
       ORDER BY pr.updated_at DESC`,
      [productId]
    );

    return res.json({ ok: true, reviews });
  } catch (err) {
    console.error('listProductReviews error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function saveProductReview(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    const userId = req.user && req.user.user_id;
    const rating = parseInt(req.body.rating, 10);
    const reviewText = String(req.body.review_text || '').trim();

    if (!userId) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    if (!productId) return res.status(400).json({ ok: false, message: 'Invalid product id' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ ok: false, message: 'Rating must be between 1 and 5.' });
    }
    if (!reviewText) return res.status(400).json({ ok: false, message: 'Review text is required.' });
    if (reviewText.length > 1000) {
      return res.status(400).json({ ok: false, message: 'Review must be 1000 characters or less.' });
    }

    const [products] = await db.query('SELECT product_id FROM products WHERE product_id = ?', [productId]);
    if (!products.length) return res.status(404).json({ ok: false, message: 'Product not found' });

    await db.query(
      `INSERT INTO product_reviews (product_id, user_id, rating, review_text)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text), updated_at = CURRENT_TIMESTAMP`,
      [productId, userId, rating, reviewText]
    );

    const [[summary]] = await db.query(
      `SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating,
              COUNT(review_id) AS review_count
       FROM product_reviews
       WHERE product_id = ?`,
      [productId]
    );

    return res.json({
      ok: true,
      message: 'Review saved.',
      summary: {
        avg_rating: Number(summary.avg_rating || 0),
        review_count: Number(summary.review_count || 0)
      }
    });
  } catch (err) {
    console.error('saveProductReview error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = { listProducts, getProduct, listProductReviews, saveProductReview };
