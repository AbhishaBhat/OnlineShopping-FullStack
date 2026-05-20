const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification } = require('../controllers/authController');

router.post('/auth/register',           register);
router.post('/auth/login',              login);
router.get ('/auth/verify-email',       verifyEmail);
router.post('/auth/resend-verification',resendVerification);

module.exports = router;