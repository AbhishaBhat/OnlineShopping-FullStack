const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'online_shop',
  waitForConnections: true,
  connectionLimit: 10
});

function getUserId(req) {
  if (req.user && req.user.id) return req.user.id;
  // temporary/testing fallback
  return req.body.user_id || req.query.user_id || 1;
}

// GET /api/cart
router.get('/cart', async (req, res) => {
  try {
    const userId = getUserId(req);
    const [rows] = await pool.query(
      `SELECT c.product_id, c.quantity, p.product_name, p.price
       FROM cart c
       LEFT JOIN products p ON p.product_id = c.product_id
       WHERE c.user_id = ?`, [userId]);
    return res.json({ ok: true, items: rows });
  } catch (err) {
    console.error('[GET /api/cart] error', err && err.stack || err);
    return res.status(500).json({ ok:false, message: err && err.message });
  }
});

// POST /api/cart/update  { product_id, quantity }
router.post('/cart/update', async (req, res) => {
  let conn;
  try {
    const userId = getUserId(req);
    const { product_id, quantity } = req.body || {};
    if (!product_id || quantity == null) return res.status(400).json({ ok:false, message:'product_id and quantity required' });
    const newQty = Number(quantity);
    if (isNaN(newQty) || newQty < 0) return res.status(400).json({ ok:false, message:'invalid quantity' });

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [pRows] = await conn.query('SELECT stock, price FROM products WHERE product_id = ? FOR UPDATE', [product_id]);
    if (!pRows.length) throw new Error('Product not found');
    const prod = pRows[0];

    const [cRows] = await conn.query('SELECT quantity FROM cart WHERE user_id = ? AND product_id = ? FOR UPDATE', [userId, product_id]);
    const oldQty = cRows.length ? Number(cRows[0].quantity || 0) : 0;
    const delta = newQty - oldQty;

    if (delta > 0) {
      if (prod.stock < delta) throw new Error('Insufficient stock');
      await conn.query('UPDATE products SET stock = stock - ? WHERE product_id = ?', [delta, product_id]);
    } else if (delta < 0) {
      await conn.query('UPDATE products SET stock = stock + ? WHERE product_id = ?', [Math.abs(delta), product_id]);
    }

    if (newQty === 0) {
      await conn.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, product_id]);
    } else if (cRows.length) {
      await conn.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?', [newQty, userId, product_id]);
    } else {
      await conn.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, product_id, newQty]);
    }

    await conn.commit();
    return res.json({ ok:true });
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch(e) {}
    console.error('[POST /api/cart/update] error', err && err.stack || err);
    return res.status(500).json({ ok:false, message: err && err.message });
  } finally {
    if (conn) try { conn.release(); } catch(e) {}
  }
});

// POST /api/cart/remove { product_id } - compatibility
router.post('/cart/remove', async (req, res) => {
  let conn;
  try {
    const userId = getUserId(req);
    const { product_id } = req.body || {};
    if (!product_id) return res.status(400).json({ ok:false, message:'product_id required' });

    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [cRows] = await conn.query('SELECT quantity FROM cart WHERE user_id = ? AND product_id = ? FOR UPDATE', [userId, product_id]);
    if (!cRows.length) { await conn.commit(); return res.json({ ok:true }); }
    const qty = Number(cRows[0].quantity || 0);
    if (qty > 0) {
      await conn.query('UPDATE products SET stock = stock + ? WHERE product_id = ?', [qty, product_id]);
    }
    await conn.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, product_id]);
    await conn.commit();
    return res.json({ ok:true });
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch(e) {}
    console.error('[POST /api/cart/remove] error', err && err.stack || err);
    return res.status(500).json({ ok:false, message: err && err.message });
  } finally {
    if (conn) try { conn.release(); } catch(e) {}
  }
});

// DELETE /api/cart/:productId
router.delete('/cart/:productId', async (req, res) => {
  let conn;
  try {
    const userId = getUserId(req);
    const pid = req.params.productId;
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [cRows] = await conn.query('SELECT quantity FROM cart WHERE user_id = ? AND product_id = ? FOR UPDATE', [userId, pid]);
    if (cRows.length) {
      const qty = Number(cRows[0].quantity || 0);
      if (qty > 0) {
        await conn.query('UPDATE products SET stock = stock + ? WHERE product_id = ?', [qty, pid]);
      }
      await conn.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, pid]);
    }
    await conn.commit();
    return res.json({ ok:true });
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch(e) {}
    console.error('[DELETE /api/cart/:productId] error', err && err.stack || err);
    return res.status(500).json({ ok:false, message: err && err.message });
  } finally {
    if (conn) try { conn.release(); } catch(e) {}
  }
});

module.exports = router;