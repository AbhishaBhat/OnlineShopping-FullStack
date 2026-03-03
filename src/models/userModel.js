const db = require('../config/db');

// User model
const User = {
    create: async (userData) => {
        const { full_name, email, password, phone, address, role } = userData;
        const [result] = await db.execute(
            'INSERT INTO users (full_name, email, hashed_password, phone, address, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [full_name, email, password, phone || null, address || null, role || 'user', 'active']
        );
        return result.insertId;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ?', [id]);
        return rows[0];
    },

    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    update: async (id, userData) => {
        const { full_name, email, phone, address } = userData;
        await db.execute(
            'UPDATE users SET full_name = ?, email = ?, phone = ?, address = ? WHERE user_id = ?',
            [full_name, email, phone, address, id]
        );
    },

    delete: async (id) => {
        await db.execute('DELETE FROM users WHERE user_id = ?', [id]);
    }
};

module.exports = User;