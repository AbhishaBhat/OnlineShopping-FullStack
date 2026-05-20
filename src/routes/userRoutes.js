const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { me, updateAddress } = require('../controllers/userController');

router.get('/me', authenticate, me);
router.get('/user/me', authenticate, me);
router.put('/me/address', authenticate, updateAddress);
router.put('/user/address', authenticate, updateAddress);

module.exports = router;
