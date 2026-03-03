const express = require('express');
const router = express.Router();
const { listProducts, getProduct } = require('../controllers/productController');

router.get('/products', listProducts); // optional ?category_id handled on client (or add query)
router.get('/products/:id', getProduct);

module.exports = router;