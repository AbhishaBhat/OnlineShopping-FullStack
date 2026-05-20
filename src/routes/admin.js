const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/auth');
const admin = require('../controllers/adminController');

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', admin.dashboard);
router.get('/analytics', admin.analytics);
router.get('/inventory', admin.inventory);
router.get('/products', admin.listProductsAdmin);
router.post('/products', admin.createProduct);
router.put('/products/:id', admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);
router.put('/products/:id/inventory', admin.updateInventory);
router.get('/categories', admin.listCategoriesAdmin);
router.post('/categories', admin.addCategory);
router.put('/categories/:id', admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);
router.get('/users', admin.listUsers);
router.put('/users/:id', admin.updateUser);
router.delete('/users/:id', admin.deleteUser);
router.get('/orders', admin.listOrdersAdmin);
router.put('/orders/:id/status', admin.updateOrderStatus);

router.get('/permissions', admin.getPermissions);
router.get('/activity', admin.getActivity);

module.exports = router;
