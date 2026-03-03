const express = require('express');
const router = express.Router();
const { listCategories, productsByCategory } = require('../controllers/categoryController');

router.get('/', listCategories);
router.get('/:id/products', productsByCategory);

module.exports = router;