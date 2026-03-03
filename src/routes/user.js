const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const db = require('../config/db');

router.get('/me', authenticate, (req, res) => {
  res.json({ ok: true, user: req.user });
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const { phone, address } = req.body;
    await db.query('UPDATE users SET phone = ?, address = ? WHERE id = ?', [phone, address, req.user.id]);
    return res.json({ ok: true, message: 'Updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM user_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [req.user.id]);
    return res.json({ ok: true, history: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;