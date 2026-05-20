const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { listProducts, getProduct, listProductReviews, saveProductReview } = require('../controllers/productController');

router.get('/products', listProducts); // optional ?category_id handled on client (or add query)
router.get('/products/:id/reviews', listProductReviews);
router.post('/products/:id/reviews', authenticate, saveProductReview);
router.get('/products/:id', getProduct);

module.exports = router;
