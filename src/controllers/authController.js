const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, resendVerificationEmail } = require('../utils/mailer');
require('dotenv').config();

// ─── REGISTER ───────────────────────────────────────────────────────────────
async function register(req, res) {
    try {
        const { full_name, email, phone, address, password } = req.body;
        if (!full_name || !email || !password || !address)
            return res.status(400).json({ ok: false, message: 'Full name, email, address, and password are required.' });

        // Check if email already exists
        const [existing] = await db.query('SELECT user_id, email_verified FROM users WHERE email = ?', [email]);
        if (existing.length) {
            // If registered but not verified, allow resend
            if (!existing[0].email_verified) {
                return res.status(400).json({
                    ok: false,
                    message: 'Email already registered but not verified.',
                    notVerified: true
                });
            }
            return res.status(400).json({ ok: false, message: 'Email already registered.' });
        }

        // Hash password & generate verification token
        const hash = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.query(
            `INSERT INTO users
             (full_name, email, hashed_password, phone, address, role, status,
              email_verified, verify_token, token_expires, created_at)
             VALUES (?, ?, ?, ?, ?, 'user', 'active', 0, ?, ?, NOW())`,
            [full_name, email, hash, phone || null, address || null, token, expires]
        );

        // Send verification email (non-blocking — don't let email failure break registration)
        try {
            await sendVerificationEmail(email, full_name, token);
        } catch (mailErr) {
            console.error('⚠️  Email send failed:', mailErr.message);
            // Still return success — user can request resend
        }

        return res.json({
            ok: true,
            message: 'Account created! Please check your email to verify your account.'
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ ok: false, message: 'Server error during registration.' });
    }
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
async function login(req, res) {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const expectedRole = req.body.role ? String(req.body.role).trim().toLowerCase() : null;
        if (!email || !password) {
            return res.status(400).json({ ok: false, message: 'Email and password are required.' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (!rows.length)
            return res.status(401).json({ ok: false, message: 'Invalid email or password.' });

        const user = rows[0];

        const match = await bcrypt.compare(password, user.hashed_password);
        if (!match)
            return res.status(401).json({ ok: false, message: 'Invalid email or password.' });

        if (user.status !== 'active')
            return res.status(403).json({ ok: false, message: 'Your account has been deactivated. Contact support.' });

        if (expectedRole && user.role !== expectedRole) {
            return res.status(403).json({
                ok: false,
                message: expectedRole === 'admin'
                    ? 'This account is not an admin account.'
                    : 'Please use the admin login for this account.'
            });
        }

        // Block login if email not verified
        if (!user.email_verified) {
            return res.status(403).json({
                ok: false,
                message: 'Please verify your email before logging in.',
                notVerified: true,
                email: user.email
            });
        }

        // Update last login
        await db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return res.json({ ok: true, token, role: user.role });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ ok: false, message: 'Server error during login.' });
    }
}

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
async function verifyEmail(req, res) {
    try {
        const { token } = req.query;
        if (!token)
            return res.status(400).json({ ok: false, message: 'Verification token is missing.' });

        const [rows] = await db.query(
            'SELECT user_id, token_expires FROM users WHERE verify_token = ? AND email_verified = 0',
            [token]
        );

        if (!rows.length)
            return res.status(400).json({ ok: false, message: 'Invalid or already used verification link.' });

        const user = rows[0];

        // Check token expiry
        if (new Date() > new Date(user.token_expires)) {
            return res.status(400).json({ ok: false, message: 'Verification link has expired. Please request a new one.' });
        }

        // Mark as verified and clear the token
        await db.query(
            'UPDATE users SET email_verified = 1, verify_token = NULL, token_expires = NULL WHERE user_id = ?',
            [user.user_id]
        );

        return res.json({ ok: true, message: 'Email verified successfully! You can now log in.' });
    } catch (err) {
        console.error('Verify email error:', err);
        return res.status(500).json({ ok: false, message: 'Server error during verification.' });
    }
}

// ─── RESEND VERIFICATION EMAIL ───────────────────────────────────────────────
async function resendVerification(req, res) {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ ok: false, message: 'Email is required.' });

        const [rows] = await db.query(
            'SELECT user_id, full_name, email_verified FROM users WHERE email = ?',
            [email]
        );

        if (!rows.length)
            return res.status(404).json({ ok: false, message: 'No account found with that email.' });

        const user = rows[0];

        if (user.email_verified)
            return res.status(400).json({ ok: false, message: 'This email is already verified.' });

        // Generate a fresh token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.query(
            'UPDATE users SET verify_token = ?, token_expires = ? WHERE user_id = ?',
            [token, expires, user.user_id]
        );

        await resendVerificationEmail(email, user.full_name, token);

        return res.json({ ok: true, message: 'Verification email resent! Please check your inbox.' });
    } catch (err) {
        console.error('Resend verification error:', err);
        return res.status(500).json({ ok: false, message: 'Server error while resending email.' });
    }
}

module.exports = { register, login, verifyEmail, resendVerification };
