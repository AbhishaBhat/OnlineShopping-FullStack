const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkout, listOrders, getOrder, invoicePDF } = require('../controllers/orderController');

router.post('/orders/checkout', authenticate, checkout);
router.get('/orders', authenticate, listOrders);
router.get('/orders/:id', authenticate, getOrder);

module.exports = router;