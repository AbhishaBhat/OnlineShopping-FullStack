const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();

// mount routes
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
app.use('/api', cartRoutes);
app.use('/api', checkoutRoutes);

// global error handler (dev)
app.use(function (err, req, res, next) {
  console.error('Unhandled error:', err && err.stack || err);
  res.status(err.status || 500).json({ ok: false, message: err && err.message || 'Server error' });
});

module.exports = app;