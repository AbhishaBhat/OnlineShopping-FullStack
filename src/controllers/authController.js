const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function register(req, res) {
  try {
    const { full_name, email, phone, address, password } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ ok: false, message: 'Missing fields' });

    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ ok: false, message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const role = 'user';
    // hashed_password column, status uses enum ('active'/'inactive')
    await db.query(
      'INSERT INTO users (full_name, email, hashed_password, phone, address, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [full_name, email, hash, phone || null, address || null, role, 'active']
    );
    return res.json({ ok: true, message: 'Registered' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ ok: false, message: 'Invalid credentials' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) return res.status(400).json({ ok: false, message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ ok: false, message: 'Account inactive' });

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    return res.json({ ok: true, token, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = { register, login };