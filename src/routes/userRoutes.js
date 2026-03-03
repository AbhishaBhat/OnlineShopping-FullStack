const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { me } = require('../controllers/userController');

router.get('/me', authenticate, me);

module.exports = router;