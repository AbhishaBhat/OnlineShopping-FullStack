const db = require('../config/db');
const { addAdminActivity } = require('../utils/history');

async function dashboard(req, res) {
  try {
    const [[uRows], [pRows], [oRows], [cRows], [revenueRows], [lowStockRows], [recentOrders], [topProducts], [revenueByDay], [statusRows], [categorySales], [customerRows]] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM products'),
      db.query('SELECT COUNT(*) as count FROM orders'),
      db.query('SELECT COUNT(*) as count FROM categories'),
      db.query(`SELECT COALESCE(SUM(total_amount), 0) as total_revenue,
                       COALESCE(AVG(total_amount), 0) as average_order_value
                FROM orders
                WHERE order_status <> 'CANCELLED'`),
      db.query(`SELECT product_id AS id, product_name AS name, stock, price
                FROM products
                WHERE stock <= 5
                ORDER BY stock ASC, product_name ASC
                LIMIT 8`),
      db.query(`SELECT o.order_id, o.total_amount, o.order_status, o.order_date, u.full_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.user_id
                ORDER BY o.order_date DESC
                LIMIT 8`),
      db.query(`SELECT p.product_id AS id, p.product_name AS name,
                       COALESCE(SUM(oi.quantity), 0) AS units_sold,
                       COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                GROUP BY p.product_id, p.product_name
                ORDER BY units_sold DESC, revenue DESC
                LIMIT 5`),
      db.query(`SELECT DATE(order_date) AS day, COALESCE(SUM(total_amount), 0) AS revenue
                FROM orders
                WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                  AND order_status <> 'CANCELLED'
                GROUP BY DATE(order_date)
                ORDER BY day ASC`),
      db.query(`SELECT order_status, COUNT(*) AS count
                FROM orders
                GROUP BY order_status`),
      db.query(`SELECT c.category_id AS id, c.category_name AS name,
                       COALESCE(SUM(oi.quantity), 0) AS units_sold,
                       COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
                FROM categories c
                LEFT JOIN products p ON p.category_id = c.category_id
                LEFT JOIN order_items oi ON oi.product_id = p.product_id
                GROUP BY c.category_id, c.category_name
                ORDER BY revenue DESC, units_sold DESC
                LIMIT 8`),
      db.query(`SELECT u.user_id AS id, u.full_name, u.email,
                       COUNT(o.order_id) AS orders,
                       COALESCE(SUM(o.total_amount), 0) AS total_spent
                FROM users u
                LEFT JOIN orders o ON o.user_id = u.user_id AND o.order_status <> 'CANCELLED'
                WHERE u.role = 'user'
                GROUP BY u.user_id, u.full_name, u.email
                ORDER BY total_spent DESC
                LIMIT 8`)
    ]);

    return res.json({
      ok: true,
      stats: {
        users: uRows[0] ? uRows[0].count : 0,
        products: pRows[0] ? pRows[0].count : 0,
        orders: oRows[0] ? oRows[0].count : 0,
        categories: cRows[0] ? cRows[0].count : 0,
        total_revenue: Number(revenueRows[0]?.total_revenue || 0),
        average_order_value: Number(revenueRows[0]?.average_order_value || 0)
      },
      low_stock: lowStockRows,
      recent_orders: recentOrders,
      top_products: topProducts.map(p => ({
        ...p,
        units_sold: Number(p.units_sold || 0),
        revenue: Number(p.revenue || 0)
      })),
      revenue_by_day: revenueByDay.map(r => ({
        day: r.day,
        revenue: Number(r.revenue || 0)
      })),
      order_status: statusRows,
      category_sales: categorySales.map(row => ({
        ...row,
        units_sold: Number(row.units_sold || 0),
        revenue: Number(row.revenue || 0)
      })),
      top_customers: customerRows.map(row => ({
        ...row,
        orders: Number(row.orders || 0),
        total_spent: Number(row.total_spent || 0)
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function analytics(req, res) {
  try {
    const [[products], [daily], [statuses], [categories]] = await Promise.all([
      db.query(`SELECT p.product_id AS id, p.product_name AS name, p.stock, p.price,
                       COALESCE(SUM(oi.quantity), 0) AS units_sold,
                       COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
                FROM products p
                LEFT JOIN order_items oi ON oi.product_id = p.product_id
                GROUP BY p.product_id, p.product_name, p.stock, p.price
                ORDER BY revenue DESC, units_sold DESC, p.product_name ASC`),
      db.query(`SELECT DATE(order_date) AS day, COUNT(*) AS orders, COALESCE(SUM(total_amount), 0) AS revenue
                FROM orders
                WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
                GROUP BY DATE(order_date)
                ORDER BY day ASC`),
      db.query(`SELECT order_status AS status, COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS revenue
                FROM orders
                GROUP BY order_status`),
      db.query(`SELECT c.category_id AS id, c.category_name AS name,
                       COALESCE(SUM(oi.quantity), 0) AS units_sold,
                       COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
                FROM categories c
                LEFT JOIN products p ON p.category_id = c.category_id
                LEFT JOIN order_items oi ON oi.product_id = p.product_id
                GROUP BY c.category_id, c.category_name
                ORDER BY revenue DESC`)
    ]);

    return res.json({
      ok: true,
      products: products.map(row => ({
        ...row,
        price: Number(row.price || 0),
        stock: Number(row.stock || 0),
        units_sold: Number(row.units_sold || 0),
        revenue: Number(row.revenue || 0)
      })),
      daily: daily.map(row => ({
        ...row,
        orders: Number(row.orders || 0),
        revenue: Number(row.revenue || 0)
      })),
      statuses: statuses.map(row => ({
        ...row,
        count: Number(row.count || 0),
        revenue: Number(row.revenue || 0)
      })),
      categories: categories.map(row => ({
        ...row,
        units_sold: Number(row.units_sold || 0),
        revenue: Number(row.revenue || 0)
      }))
    });
  } catch (err) {
    console.error('analytics error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function inventory(req, res) {
  try {
    const threshold = Math.max(0, parseInt(req.query.threshold, 10) || 5);
    const [rows] = await db.query(
      `SELECT p.product_id AS id, p.product_name AS name, p.description, p.price, p.stock,
              p.category_id, p.image_url, c.category_name AS category
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       ORDER BY
         CASE WHEN p.stock <= ? THEN 0 ELSE 1 END,
         p.stock ASC,
         p.product_name ASC`,
      [threshold]
    );

    return res.json({
      ok: true,
      threshold,
      products: rows.map(row => ({
        ...row,
        price: Number(row.price || 0),
        stock: Number(row.stock || 0),
        stock_status: row.stock <= 0 ? 'out' : row.stock <= threshold ? 'low' : 'healthy'
      }))
    });
  } catch (err) {
    console.error('inventory error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function listProductsAdmin(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT p.product_id AS id, p.product_name AS name, p.description, p.price, p.stock,
              p.category_id, p.image_url, p.created_at, c.category_name AS category,
              COALESCE(SUM(oi.quantity), 0) AS units_sold,
              COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN order_items oi ON oi.product_id = p.product_id
       GROUP BY p.product_id, p.product_name, p.description, p.price, p.stock,
                p.category_id, p.image_url, p.created_at, c.category_name
       ORDER BY p.created_at DESC`
    );

    return res.json({
      ok: true,
      products: rows.map(row => ({
        ...row,
        price: Number(row.price || 0),
        stock: Number(row.stock || 0),
        units_sold: Number(row.units_sold || 0),
        revenue: Number(row.revenue || 0)
      }))
    });
  } catch (err) {
    console.error('listProductsAdmin error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function createProduct(req, res) {
  try {
    const name = String(req.body.name || req.body.product_name || '').trim();
    const description = String(req.body.description || '').trim();
    const price = Number(req.body.price);
    const stock = parseInt(req.body.stock, 10);
    const categoryId = req.body.category_id ? parseInt(req.body.category_id, 10) : null;
    const imageUrl = String(req.body.image_url || '').trim() || null;

    if (!name) return res.status(400).json({ ok: false, message: 'Product name is required' });
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ ok: false, message: 'Valid price is required' });
    if (Number.isNaN(stock) || stock < 0) return res.status(400).json({ ok: false, message: 'Valid stock is required' });

    const [result] = await db.query(
      `INSERT INTO products (product_name, description, price, stock, category_id, image_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [name, description || null, price, stock, categoryId, imageUrl]
    );

    await addAdminActivity(req.user.user_id, 'add_product', { id: result.insertId, name });
    return res.status(201).json({ ok: true, id: result.insertId, message: 'Product added' });
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function updateProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const name = String(req.body.name || req.body.product_name || '').trim();
    const description = String(req.body.description || '').trim();
    const price = Number(req.body.price);
    const stock = parseInt(req.body.stock, 10);
    const categoryId = req.body.category_id ? parseInt(req.body.category_id, 10) : null;
    const imageUrl = String(req.body.image_url || '').trim() || null;

    if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid product id' });
    if (!name) return res.status(400).json({ ok: false, message: 'Product name is required' });
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ ok: false, message: 'Valid price is required' });
    if (Number.isNaN(stock) || stock < 0) return res.status(400).json({ ok: false, message: 'Valid stock is required' });

    const [result] = await db.query(
      `UPDATE products
       SET product_name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ?
       WHERE product_id = ?`,
      [name, description || null, price, stock, categoryId, imageUrl, id]
    );

    if (!result.affectedRows) return res.status(404).json({ ok: false, message: 'Product not found' });
    await addAdminActivity(req.user.user_id, 'edit_product', { id, name });
    return res.json({ ok: true, message: 'Product updated' });
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function deleteProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid product id' });

    const [result] = await db.query('DELETE FROM products WHERE product_id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, message: 'Product not found' });

    await addAdminActivity(req.user.user_id, 'delete_product', { id });
    return res.json({ ok: true, message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function updateInventory(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const stock = parseInt(req.body.stock, 10);
    const price = req.body.price === undefined || req.body.price === '' ? null : Number(req.body.price);

    if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid product id' });
    if (Number.isNaN(stock) || stock < 0) return res.status(400).json({ ok: false, message: 'Stock must be 0 or more' });
    if (price !== null && (!Number.isFinite(price) || price < 0)) return res.status(400).json({ ok: false, message: 'Price must be 0 or more' });

    const fields = ['stock = ?'];
    const params = [stock];
    if (price !== null) {
      fields.push('price = ?');
      params.push(price);
    }
    params.push(id);

    const [result] = await db.query(`UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`, params);
    if (!result.affectedRows) return res.status(404).json({ ok: false, message: 'Product not found' });

    await addAdminActivity(req.user.user_id, 'update_inventory', { id, stock, price });
    return res.json({ ok: true, message: 'Inventory updated' });
  } catch (err) {
    console.error('updateInventory error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function addCategory(req, res) {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    if (!name) return res.status(400).json({ ok: false, message: 'Category name is required' });
    const [r] = await db.query('INSERT INTO categories (category_name, description, created_at) VALUES (?, ?, NOW())', [name, description]);
    await addAdminActivity(req.user.user_id, 'add_category', { id: r.insertId, name });
    return res.json({ ok: true, id: r.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function listCategoriesAdmin(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT c.category_id AS id, c.category_name AS name, c.description, c.created_at,
              COUNT(p.product_id) AS products
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.category_id
       GROUP BY c.category_id, c.category_name, c.description, c.created_at
       ORDER BY c.category_name ASC`
    );
    return res.json({ ok: true, categories: rows.map(row => ({ ...row, products: Number(row.products || 0) })) });
  } catch (err) {
    console.error('listCategoriesAdmin error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function updateCategory(req, res) {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    await db.query('UPDATE categories SET category_name=?, description=? WHERE category_id=?', [name, description, id]);
    await addAdminActivity(req.user.user_id, 'edit_category', { id, name });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function deleteCategory(req, res) {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM categories WHERE category_id = ?', [id]);
    await addAdminActivity(req.user.user_id, 'delete_category', { id });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function listUsers(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT u.user_id AS id, u.full_name, u.email, u.phone, u.address, u.role, u.status,
              u.last_login, u.created_at, COUNT(o.order_id) AS orders,
              COALESCE(SUM(o.total_amount), 0) AS total_spent
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.user_id
       GROUP BY u.user_id, u.full_name, u.email, u.phone, u.address, u.role, u.status, u.last_login, u.created_at
       ORDER BY u.created_at DESC`
    );
    return res.json({
      ok: true,
      users: rows.map(row => ({
        ...row,
        orders: Number(row.orders || 0),
        total_spent: Number(row.total_spent || 0)
      }))
    });
  } catch (err) {
    console.error('listUsers error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function updateUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const status = String(req.body.status || '').trim();
    const role = String(req.body.role || '').trim();
    if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid user id' });
    if (!['active', 'inactive'].includes(status)) return res.status(400).json({ ok: false, message: 'Invalid status' });
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ ok: false, message: 'Invalid role' });

    await db.query('UPDATE users SET status = ?, role = ? WHERE user_id = ?', [status, role, id]);
    await addAdminActivity(req.user.user_id, 'edit_user', { id, status, role });
    return res.json({ ok: true, message: 'User updated' });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid user id' });
    if (id === req.user.user_id) return res.status(400).json({ ok: false, message: 'You cannot delete your own admin account' });

    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, message: 'User not found' });
    await addAdminActivity(req.user.user_id, 'delete_user', { id });
    return res.json({ ok: true, message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function listOrdersAdmin(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT o.order_id, o.user_id, u.full_name, u.email, o.total_amount,
              o.order_status, o.order_date, o.shipping_address, o.payment_method,
              COUNT(oi.id) AS item_lines, COALESCE(SUM(oi.quantity), 0) AS item_count
       FROM orders o
       LEFT JOIN users u ON u.user_id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.order_id
       GROUP BY o.order_id, o.user_id, u.full_name, u.email, o.total_amount,
                o.order_status, o.order_date, o.shipping_address, o.payment_method
       ORDER BY o.order_date DESC`
    );
    return res.json({
      ok: true,
      orders: rows.map(row => ({
        ...row,
        total_amount: Number(row.total_amount || 0),
        item_lines: Number(row.item_lines || 0),
        item_count: Number(row.item_count || 0)
      }))
    });
  } catch (err) {
    console.error('listOrdersAdmin error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const status = String(req.body.status || '').trim().toUpperCase();
    const allowed = ['PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (Number.isNaN(id)) return res.status(400).json({ ok: false, message: 'Invalid order id' });
    if (!allowed.includes(status)) return res.status(400).json({ ok: false, message: 'Invalid order status' });

    const [result] = await db.query('UPDATE orders SET order_status = ? WHERE order_id = ?', [status, id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, message: 'Order not found' });
    await addAdminActivity(req.user.user_id, 'update_order_status', { id, status });
    return res.json({ ok: true, message: 'Order updated' });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function getPermissions(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM admin_permissions WHERE user_id = ?', [req.user.user_id]);
    return res.json({ ok: true, permissions: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

async function getActivity(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM admin_activity ORDER BY action_time DESC LIMIT 500');
    return res.json({ ok: true, activity: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = {
  dashboard,
  analytics,
  inventory,
  updateInventory,
  listProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategoriesAdmin,
  addCategory,
  updateCategory,
  deleteCategory,
  listUsers,
  updateUser,
  deleteUser,
  listOrdersAdmin,
  updateOrderStatus,
  getPermissions,
  getActivity
};
