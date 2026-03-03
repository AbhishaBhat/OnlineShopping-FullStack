const db = require('../config/db');
const { addUserHistory } = require('../utils/history');

async function getCart(req, res) {
  try {
    const user_id = req.user && req.user.user_id;
    if (!user_id) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const [rows] = await db.query(
      `SELECT c.cart_id AS id, c.product_id, c.quantity, p.product_name AS name, p.price
       FROM cart c
       LEFT JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ?
       ORDER BY c.added_at DESC`,
      [user_id]
    );
    return res.json({ ok: true, items: rows || [] });
  } catch (err) {
    console.error('getCart error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function addToCart(req, res) {
  let conn;
  try {
    const user_id = req.user && req.user.user_id;
    if (!user_id) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const product_id = parseInt(req.body.product_id, 10);
    const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);
    if (!product_id) return res.status(400).json({ ok: false, message: 'product_id required' });

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [pRows] = await conn.query(
      'SELECT product_id, product_name, stock FROM products WHERE product_id = ? FOR UPDATE',
      [product_id]
    );
    if (!pRows.length) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ ok: false, message: 'Product not found' });
    }
    const product = pRows[0];

    const [existingRows] = await conn.query(
      'SELECT cart_id, quantity FROM cart WHERE user_id = ? AND product_id = ? FOR UPDATE',
      [user_id, product_id]
    );

    let delta = quantity;
    if (existingRows.length) {
      if (product.stock < quantity) {
        await conn.rollback(); conn.release();
        return res.status(400).json({ ok: false, message: 'Insufficient stock for requested quantity' });
      }
      const newQty = existingRows[0].quantity + quantity;
      await conn.query('UPDATE cart SET quantity = ? WHERE cart_id = ?', [newQty, existingRows[0].cart_id]);
    } else {
      if (product.stock < quantity) {
        await conn.rollback(); conn.release();
        return res.status(400).json({ ok: false, message: 'Insufficient stock for requested quantity' });
      }
      await conn.query(
        'INSERT INTO cart (user_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())',
        [user_id, product_id, quantity]
      );
    }

    await conn.query('UPDATE products SET stock = stock - ? WHERE product_id = ?', [delta, product_id]);

    await conn.commit();
    conn.release();
    await addUserHistory(user_id, `cart:add:${product_id}:${delta}`);
    return res.status(201).json({ ok: true, message: 'Added to cart' });
  } catch (err) {
    if (conn) { try { await conn.rollback(); conn.release(); } catch (e) {} }
    console.error('addToCart error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function removeFromCart(req, res) {
  let conn;
  try {
    const user_id = req.user && req.user.user_id;
    if (!user_id) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    const cartIdParam = req.params.id ? parseInt(req.params.id, 10) : null;
    const bodyCartId = req.body && req.body.cart_id ? parseInt(req.body.cart_id, 10) : null;
    const bodyProductId = req.body && req.body.product_id ? parseInt(req.body.product_id, 10) : null;
    const reqQty = req.body && req.body.quantity ? Math.max(1, parseInt(req.body.quantity, 10)) : null;

    conn = await db.getConnection();
    await conn.beginTransaction();

    let cartRow;
    if (cartIdParam) {
      const [rows] = await conn.query(
        'SELECT cart_id, product_id, quantity FROM cart WHERE cart_id = ? AND user_id = ? FOR UPDATE',
        [cartIdParam, user_id]
      );
      cartRow = rows[0];
    } else if (bodyCartId) {
      const [rows] = await conn.query(
        'SELECT cart_id, product_id, quantity FROM cart WHERE cart_id = ? AND user_id = ? FOR UPDATE',
        [bodyCartId, user_id]
      );
      cartRow = rows[0];
    } else if (bodyProductId) {
      const [rows] = await conn.query(
        'SELECT cart_id, product_id, quantity FROM cart WHERE product_id = ? AND user_id = ? FOR UPDATE',
        [bodyProductId, user_id]
      );
      cartRow = rows[0];
    } else {
      await conn.rollback(); conn.release();
      return res.status(400).json({ ok: false, message: 'cart_id or product_id required' });
    }

    if (!cartRow) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ ok: false, message: 'Cart item not found' });
    }

    const removeQty = reqQty ? Math.min(reqQty, cartRow.quantity) : cartRow.quantity;
    const remaining = cartRow.quantity - removeQty;

    if (remaining > 0) {
      await conn.query('UPDATE cart SET quantity = ? WHERE cart_id = ?', [remaining, cartRow.cart_id]);
    } else {
      await conn.query('DELETE FROM cart WHERE cart_id = ?', [cartRow.cart_id]);
    }

    await conn.query('UPDATE products SET stock = stock + ? WHERE product_id = ?', [removeQty, cartRow.product_id]);

    await conn.commit();
    conn.release();
    await addUserHistory(user_id, `cart:remove:${cartRow.product_id}:${removeQty}`);
    return res.json({ ok: true, message: 'Removed from cart', removed: removeQty, remaining });
  } catch (err) {
    if (conn) { try { await conn.rollback(); conn.release(); } catch (e) {} }
    console.error('removeFromCart error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function updateCartItem(req, res) {
  let conn;
  try {
    const user_id = req.user && req.user.user_id;
    if (!user_id) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const cart_id = parseInt(req.params.id, 10);
    const newQty = Math.max(0, parseInt(req.body.quantity, 10) || 0);
    if (Number.isNaN(cart_id)) return res.status(400).json({ ok: false, message: 'Invalid cart id' });

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [cRows] = await conn.query(
      'SELECT cart_id, product_id, quantity FROM cart WHERE cart_id = ? AND user_id = ? FOR UPDATE',
      [cart_id, user_id]
    );
    if (!cRows.length) { await conn.rollback(); conn.release(); return res.status(404).json({ ok: false, message: 'Cart item not found' }); }
    const cart = cRows[0];

    if (newQty === 0) {
      await conn.query('DELETE FROM cart WHERE cart_id = ?', [cart_id]);
      await conn.query('UPDATE products SET stock = stock + ? WHERE product_id = ?', [cart.quantity, cart.product_id]);
      await conn.commit(); conn.release();
      await addUserHistory(user_id, `cart:update:${cart.product_id}:0`);
      return res.json({ ok: true, message: 'Cart item removed' });
    }

    const [pRows] = await conn.query('SELECT stock FROM products WHERE product_id = ? FOR UPDATE', [cart.product_id]);
    if (!pRows.length) { await conn.rollback(); conn.release(); return res.status(404).json({ ok: false, message: 'Product not found' }); }
    const product = pRows[0];

    const diff = newQty - cart.quantity;
    if (diff > 0 && product.stock < diff) {
      await conn.rollback(); conn.release();
      return res.status(400).json({ ok: false, message: 'Insufficient stock to increase quantity' });
    }

    if (diff > 0) {
      await conn.query('UPDATE products SET stock = stock - ? WHERE product_id = ?', [diff, cart.product_id]);
    } else if (diff < 0) {
      await conn.query('UPDATE products SET stock = stock + ? WHERE product_id = ?', [-diff, cart.product_id]);
    }

    await conn.query('UPDATE cart SET quantity = ? WHERE cart_id = ?', [newQty, cart_id]);

    await conn.commit();
    conn.release();
    await addUserHistory(user_id, `cart:update:${cart.product_id}:${newQty}`);
    return res.json({ ok: true, message: 'Cart updated', quantity: newQty });
  } catch (err) {
    if (conn) { try { await conn.rollback(); conn.release(); } catch (e) {} }
    console.error('updateCartItem error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem
};