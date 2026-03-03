const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');

const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');

router.get('/cart', authenticate, getCart);
router.post('/cart', authenticate, addToCart);
router.post('/cart/add', authenticate, addToCart); // legacy support
router.delete('/cart/:id', authenticate, removeFromCart);
router.post('/cart/remove', authenticate, removeFromCart); // legacy support
router.put('/cart/:id', authenticate, updateCartItem);

module.exports = router;