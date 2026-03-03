const db = require('../config/db');

const Product = {
    getAllProducts: async () => {
        const [rows] = await db.execute('SELECT * FROM products');
        return rows;
    },

    getProductById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM products WHERE product_id = ?', [id]);
        return rows[0];
    },

    createProduct: async (productData) => {
        const { product_name, description, price, stock } = productData;
        const [result] = await db.execute('INSERT INTO products (product_name, description, price, stock) VALUES (?, ?, ?, ?)', [product_name, description, price, stock]);
        return result.insertId;
    },

    updateProduct: async (id, productData) => {
        const { product_name, description, price, stock } = productData;
        await db.execute('UPDATE products SET product_name = ?, description = ?, price = ?, stock = ? WHERE product_id = ?', [product_name, description, price, stock, id]);
    },

    deleteProduct: async (id) => {
        await db.execute('DELETE FROM products WHERE id = ?', [id]);
    }
};

module.exports = Product;