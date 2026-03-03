const express = require('express');
const router = express.Router();
const { listCategories, productsByCategory } = require('../controllers/categoryController');

router.get('/categories', listCategories);
router.get('/categories/:id/products', productsByCategory);

module.exports = router;