const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/auth');
const admin = require('../controllers/adminController');

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', admin.dashboard);
router.post('/categories', admin.addCategory);
router.put('/categories/:id', admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

router.get('/permissions', admin.getPermissions);
router.get('/activity', admin.getActivity);

module.exports = router;