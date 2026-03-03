const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { getWishlist, addToWishlist, removeWishlist } = require('../controllers/wishlistController');

router.get('/wishlist', authenticate, getWishlist);
router.post('/wishlist', authenticate, addToWishlist);
router.delete('/wishlist/:id', authenticate, removeWishlist);

module.exports = router;