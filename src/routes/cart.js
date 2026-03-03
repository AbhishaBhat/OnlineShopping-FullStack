const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');

router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCart);
router.post('/add', authenticate, addToCart);
router.put('/:id', authenticate, updateCartItem);
router.delete('/:id', authenticate, removeFromCart);

module.exports = router;