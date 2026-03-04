// const express = require('express');
// const path = require('path');
// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // simple health
// app.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// // mount routers BEFORE static
// const authRoutes = require('./routes/authRoutes');
// const categoryRoutes = require('./routes/categoryRoutes');
// const productRoutes = require('./routes/productRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const wishlistRoutes = require('./routes/wishlistRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const userRoutes = require('./routes/userRoutes');

// app.use('/api', authRoutes);
// app.use('/api', categoryRoutes);
// app.use('/api', productRoutes);
// app.use('/api', cartRoutes);
// app.use('/api', wishlistRoutes);
// app.use('/api', orderRoutes);
// app.use('/api', userRoutes);

// // serve public after api
// app.use(express.static(path.join(__dirname, '..', 'public')));

// // API 404 -> JSON
// app.use((req, res, next) => {
//   if (req.path.startsWith('/api')) return res.status(404).json({ ok: false, message: 'API endpoint not found' });
//   next();
// });

// // global error JSON
// app.use((err, req, res, next) => {
//   console.error(err && err.stack ? err.stack : err);
//   if (!res.headersSent) res.status(500).json({ ok: false, message: 'Server error' });
// });

// const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 4000;
// const MAX_FALLBACKS = 5;
// const allowFallback = !process.env.PORT;

// function startServer(port, attemptsLeft) {
//   const server = app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
//   });

//   server.on('error', err => {
//     if (err.code === 'EADDRINUSE' && allowFallback && attemptsLeft > 0) {
//       const nextPort = port + 1;
//       console.warn(`Port ${port} in use. Trying ${nextPort}...`);
//       setTimeout(() => startServer(nextPort, attemptsLeft - 1), 300);
//     } else {
//       console.error('Failed to start server:', err);
//       process.exit(1);
//     }
//   });
// }

// startServer(DEFAULT_PORT, MAX_FALLBACKS);

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// HEALTH CHECK
// =====================
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// =====================
// ROUTES (API)
// =====================
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);

// =====================
// SERVE FRONTEND
// =====================
app.use(express.static(path.join(__dirname, '..', 'public')));

// If no API matched, and not static file → serve index.html (optional for SPA)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// =====================
// API 404 HANDLER
// =====================
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      ok: false,
      message: 'API endpoint not found'
    });
  }
  next();
});

// =====================
// GLOBAL ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);

  if (!res.headersSent) {
    res.status(500).json({
      ok: false,
      message: 'Server error'
    });
  }
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});