const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkout, getOrder, invoicePDF } = require('../controllers/orderController');

router.post('/checkout', authenticate, checkout);
router.get('/:id', authenticate, getOrder);
router.get('/:id/invoice', authenticate, invoicePDF);

module.exports = router;