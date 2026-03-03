const db = require('../config/db');
const { addUserHistory } = require('../utils/history');
const PDFDocument = require('pdfkit');

async function checkout(req, res) {
  let conn;
  try {
    const user_id = req.user && req.user.user_id;
    if (!user_id) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    const { address = '', payment_method = 'COD' } = req.body || {};

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Fetch cart items from database
    const [cartItems] = await conn.query(
      `SELECT c.cart_id, c.product_id, c.quantity, p.price, p.product_name, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ?
       FOR UPDATE`,
      [user_id]
    );

    if (!cartItems.length) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ ok: false, message: 'Cart is empty' });
    }

    // Check stock availability
    for (const it of cartItems) {
      if (it.stock < it.quantity) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ ok: false, message: `Insufficient stock for ${it.product_name}` });
      }
    }

    // Calculate total
    const total = cartItems.reduce((s, it) => s + (Number(it.price) * Number(it.quantity)), 0);

    // Create order
    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, total_amount, order_status, order_date, shipping_address, payment_method)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [user_id, total, 'PLACED', address, payment_method]
    );
    const order_id = orderResult.insertId;
    if (!order_id) {
      await conn.rollback();
      conn.release();
      return res.status(500).json({ ok: false, message: 'Failed to create order' });
    }

    // Insert order items
    for (const it of cartItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)`,
        [order_id, it.product_id, it.quantity, it.price]
      );
    }

    // Clear cart
    await conn.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    await conn.commit();
    conn.release();

    await addUserHistory(user_id, `checkout:${order_id}`);

    return res.json({ ok: true, message: 'Order placed', order_id });
  } catch (err) {
    if (conn) { try { await conn.rollback(); conn.release(); } catch (e) { } }
    console.error('checkout error:', err);
    return res.status(500).json({ ok: false, message: 'Server error', error: err && err.message });
  }
}

async function getOrder(req, res) {
  try {
    const user_id = req.user && req.user.user_id;
    if (!user_id) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const order_id = parseInt(req.params.id, 10);
    if (Number.isNaN(order_id)) return res.status(400).json({ ok: false, message: 'Invalid order id' });

    const order = await buildOrderWithItems(order_id, user_id);
    if (!order) return res.status(404).json({ ok: false, message: 'Order not found' });
    return res.json({ ok: true, order });
  } catch (err) {
    console.error('getOrder error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function buildOrderWithItems(order_id, user_id) {
  const [orders] = await db.query(
    `SELECT o.order_id, o.user_id, o.total_amount, o.order_status, o.order_date, o.shipping_address, o.payment_method,
            u.full_name, u.phone
     FROM orders o
     JOIN users u ON o.user_id = u.user_id
     WHERE o.order_id = ? AND o.user_id = ?`,
    [order_id, user_id]
  );
  if (!orders.length) return null;
  const order = orders[0];
  const [items] = await db.query(
    `SELECT oi.product_id, oi.quantity, oi.price, p.product_name
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.product_id
     WHERE oi.order_id = ?`,
    [order_id]
  );
  order.items = items.map(it => ({
    product_id: it.product_id,
    product_name: it.product_name || `#${it.product_id}`,
    quantity: Number(it.quantity),
    price: Number(it.price),
    line_total: Number(it.price) * Number(it.quantity)
  }));
  order.total_amount = Number(order.total_amount);
  return order;
}

async function listOrders(req, res) {
  try {
    const user_id = req.user && req.user.user_id;
    if (!user_id) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    const [orders] = await db.query('SELECT order_id, total_amount, order_status, order_date FROM orders WHERE user_id = ? ORDER BY order_date DESC', [user_id]);
    if (!orders.length) return res.json({ ok: true, orders: [] });

    const orderIds = orders.map(o => o.order_id);
    const [items] = await db.query(
      `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = {};
    for (const it of items) {
      itemsByOrder[it.order_id] = itemsByOrder[it.order_id] || [];
      itemsByOrder[it.order_id].push({
        product_id: it.product_id,
        product_name: it.product_name,
        quantity: it.quantity,
        price: it.price
      });
    }

    const result = orders.map(o => ({ ...o, items: itemsByOrder[o.order_id] || [] }));
    return res.json({ ok: true, orders: result });
  } catch (err) {
    console.error('listOrders error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function invoicePDF(req, res) {
  try {
    const user_id = req.user && req.user.user_id;
    if (!user_id) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const order_id = parseInt(req.params.id, 10);
    if (Number.isNaN(order_id)) return res.status(400).json({ ok: false, message: 'Invalid order id' });

    const order = await buildOrderWithItems(order_id, user_id);
    if (!order) return res.status(404).json({ ok: false, message: 'Order not found' });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice_${order_id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fillColor('#444444').fontSize(20).text('INVOICE', 50, 50);
    doc.fillColor('#db2777').fontSize(16).text('E-Commerce App', 50, 75, { align: 'right' });
    doc.moveDown();

    // Order Info
    doc.fillColor('#000').fontSize(10)
      .text(`Order ID: ${order.order_id}`, 50, 120)
      .text(`Order Date: ${new Date(order.order_date).toLocaleDateString()}`, 50, 135)
      .text(`Total Amount: $${order.total_amount.toFixed(2)}`, 50, 150);

    // Customer Info
    doc.text('Shipping Address:', 300, 120, { bold: true })
      .text(order.shipping_address, 300, 135);

    doc.moveDown(4);

    // Table Header
    const tableTop = 220;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Quantity', 250, tableTop, { width: 90, align: 'right' });
    doc.text('Price', 340, tableTop, { width: 90, align: 'right' });
    doc.text('Total', 430, tableTop, { width: 90, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Items
    let position = tableTop + 30;
    doc.font('Helvetica');
    order.items.forEach(item => {
      doc.text(item.product_name, 50, position);
      doc.text(item.quantity.toString(), 250, position, { width: 90, align: 'right' });
      doc.text(`$${item.price.toFixed(2)}`, 340, position, { width: 90, align: 'right' });
      doc.text(`$${item.line_total.toFixed(2)}`, 430, position, { width: 90, align: 'right' });
      position += 20;
    });

    doc.moveTo(50, position + 5).lineTo(550, position + 5).stroke();
    doc.font('Helvetica-Bold').text('Grand Total:', 340, position + 20, { width: 90, align: 'right' });
    doc.text(`$${order.total_amount.toFixed(2)}`, 430, position + 20, { width: 90, align: 'right' });

    doc.end();
  } catch (err) {
    console.error('invoicePDF error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ ok: false, message: 'Failed to generate invoice' });
    }
  }
}

module.exports = { checkout, listOrders, getOrder, invoicePDF };