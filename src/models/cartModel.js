const db = require('../config/db');

const Cart = {
    getCartItems: async (userId) => {
        const [rows] = await db.execute('SELECT * FROM cart WHERE user_id = ?', [userId]);
        return rows;
    },

    addToCart: async (userId, productId, quantity) => {
        // Note: The original used ON DUPLICATE KEY UPDATE. 
        // Ensure there's a unique constraint on (user_id, product_id) in the schema or handle manually.
        const [result] = await db.execute(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
            [userId, productId, quantity, quantity]
        );
        return result;
    },

    updateCartItem: async (userId, productId, quantity) => {
        const [result] = await db.execute(
            'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId]
        );
        return result;
    },

    removeCartItem: async (userId, productId) => {
        const [result] = await db.execute(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return result;
    },

    clearCart: async (userId) => {
        const [result] = await db.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
        return result;
    }
};

module.exports = Cart;