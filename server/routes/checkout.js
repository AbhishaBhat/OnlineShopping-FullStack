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

function getUserId(req) { if (req.user && req.user.id) return req.user.id; return req.body.user_id || req.query.user_id || 1; }

router.post('/orders/checkout', async (req, res) => {
  let conn;
  try {
    const userId = getUserId(req);
    const { payment_method, total_amount, items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ ok:false, message:'Cart empty' });

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const paymentStatus = (payment_method && payment_method !== 'COD') ? 'paid' : 'pending';
    const orderStatus = 'processing';

    const [ordRes] = await conn.query(
      `INSERT INTO orders (user_id, total_amount, payment_status, order_status, order_date)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, Number(total_amount || 0), paymentStatus, orderStatus]
    );
    const orderId = ordRes.insertId;

    const itemStmt = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
    for (const it of items) {
      const pid = it.product_id;
      const qty = Number(it.quantity || 1);
      const price = Number(it.price || 0);
      await conn.query(itemStmt, [orderId, pid, qty, price]);
    }

    if (payment_method && payment_method !== 'COD') {
      await conn.query('INSERT INTO payments (order_id, payment_method, amount, payment_date) VALUES (?, ?, ?, NOW())', [orderId, payment_method, Number(total_amount || 0)]);
      await conn.query('UPDATE orders SET payment_status = ? WHERE order_id = ?', ['paid', orderId]);
    }

    await conn.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    await conn.commit();
    return res.json({ ok:true, order_id: orderId });
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch(e) {}
    console.error('[POST /api/orders/checkout] error', err && err.stack || err);
    return res.status(500).json({ ok:false, message: err && err.message });
  } finally {
    if (conn) try { conn.release(); } catch(e) {}
  }
});

module.exports = router;