const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../config/db');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = (authHeader.split(' ')[1]) || req.headers['x-access-token'];
  if (!token) return res.status(401).json({ ok: false, message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    // fetch fresh user using user_id
    const [rows] = await db.query('SELECT user_id, full_name, email, role, phone, address, status FROM users WHERE user_id = ?', [payload.id]);
    if (!rows.length) return res.status(401).json({ ok: false, message: 'Invalid token' });
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ ok: false, message: 'Forbidden' });
    next();
  };
}

module.exports = { authenticate, requireRole };