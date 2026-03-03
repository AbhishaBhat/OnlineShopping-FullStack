const db = require('../config/db');
const { addUserHistory } = require('../utils/history');

async function getWishlist(req, res) {
  try {
    const user_id = req.user.user_id;
    const [rows] = await db.query('SELECT w.wishlist_id AS id, w.product_id, w.added_at, p.product_name AS name, p.price FROM wishlist w LEFT JOIN products p ON w.product_id = p.product_id WHERE w.user_id = ?', [user_id]);
    return res.json({ ok: true, items: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function addToWishlist(req, res) {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.body;
    const [exists] = await db.query('SELECT wishlist_id FROM wishlist WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
    if (!exists.length) {
      await db.query('INSERT INTO wishlist (user_id, product_id, added_at) VALUES (?, ?, NOW())', [user_id, product_id]);
      await addUserHistory(user_id, `add_to_wishlist:${product_id}`);
    }
    return res.json({ ok: true, message: 'Added' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function removeWishlist(req, res) {
  try {
    const user_id = req.user.user_id;
    const id = req.params.id; // wishlist_id
    await db.query('DELETE FROM wishlist WHERE wishlist_id = ? AND user_id = ?', [id, user_id]);
    return res.json({ ok: true, message: 'Removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = { getWishlist, addToWishlist, removeWishlist };