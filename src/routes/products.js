const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { listProducts, getProduct, listProductReviews, saveProductReview } = require('../controllers/productController');

router.get('/', listProducts);
router.get('/:id/reviews', listProductReviews);
router.post('/:id/reviews', authenticate, saveProductReview);
router.get('/:id', getProduct);

module.exports = router;
