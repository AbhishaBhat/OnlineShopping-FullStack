const db = require('../config/db');

// Order model
const Order = {
    createOrder: async (userId, total) => {
        const [result] = await db.execute(
            'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
            [userId, total]
        );
        return result.insertId;
    },

    getOrderById: async (orderId) => {
        const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        return rows[0];
    },

    getUserOrders: async (userId) => {
        const [rows] = await db.execute('SELECT * FROM orders WHERE user_id = ?', [userId]);
        return rows;
    },

    addOrderItems: async (orderId, items) => {
        // bulk insert using query for values array
        const query = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
        const values = items.map(item => [orderId, item.productId, item.quantity, item.price]);
        const [result] = await db.query(query, [values]);
        return result;
    },

    getOrderItems: async (orderId) => {
        const [rows] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        return rows;
    }
};

module.exports = Order;