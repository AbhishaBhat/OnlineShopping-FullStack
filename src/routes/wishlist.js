const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { getWishlist, addToWishlist, removeWishlist } = require('../controllers/wishlistController');

router.get('/', authenticate, getWishlist);
router.post('/add', authenticate, addToWishlist);
router.delete('/:id', authenticate, removeWishlist);

module.exports = router;