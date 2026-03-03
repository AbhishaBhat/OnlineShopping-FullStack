const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  try {
    // Try cookie/session first (if you use sessions)
    if (req.cookies && req.cookies.token) {
      req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      return next();
    }

    // Try Authorization header: "Bearer <token>"
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      return next();
    }

    // No token -> continue without user (routes may reject)
    return next();
  } catch (err) {
    // invalid token -> clear and continue (route can return 401)
    return next();
  }
};