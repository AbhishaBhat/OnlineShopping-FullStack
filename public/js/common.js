// Full replacement: robust client helpers used by pages

const ORDER_KEY = 'happy_latest_order';

export function getToken() {
  try { return localStorage.getItem('token'); } catch { return null; }
}
export function isLoggedIn() {
  return !!getToken();
}

// Robust fetch wrapper that logs last responses to window.__apiLog (visible via #apiDebug)
export async function fetchJson(url, opts = {}) {
  opts = Object.assign({}, opts);
  opts.headers = opts.headers || {};
  // attach token from localStorage if present
  try {
    const token = localStorage.getItem('token');
    if (token && !opts.headers.Authorization) opts.headers.Authorization = 'Bearer ' + token;
  } catch (e) { }
  if (opts.body !== undefined && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
    opts.headers['Content-Type'] = 'application/json';
  }
  return fetch(url, { credentials: 'include', ...opts }).then(r => r.text().then(txt => {
    try { return Object.assign({ ok: r.ok, status: r.status }, txt ? JSON.parse(txt) : {}); } catch { return { ok: r.ok, status: r.status, raw: txt }; }
  })).catch(() => ({ ok: false, status: 0, message: 'Network error' }));
}

// Single quiet profile fetch — returns normalized user object or null (no noisy 404 spam)
export async function getProfile() {
  try {
    const res = await fetch('/api/user/me', { credentials: 'include' });
    if (!res || res.status === 404 || res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    let data;
    try { data = JSON.parse(text); } catch { return null; }
    const u = data.user || data.data?.user || data.profile || data;
    return u || null;
  } catch (err) {
    return null;
  }
}

/* Navigation helpers */
export async function updateNav() {
  const nav = document.getElementById('siteNav');
  if (!nav) return;
  const logged = isLoggedIn();
  nav.innerHTML = `
    <nav class="main-nav">
      <div class="nav-left">
        <a href="/index.html" class="logo">HAPPY<span>SHOPPING</span></a>
      </div>
      
      <div class="search-container">
        <form id="navSearchForm" class="nav-search-form">
          <input type="text" id="navSearchInput" placeholder="Search products..." class="nav-search-input">
          <button type="submit" class="search-btn">🔍</button>
        </form>
      </div>

      <ul class="nav-links">
        <li><a href="/index.html">Home</a></li>
        <li><a href="/categories.html">Collections</a></li>
        <li><a href="/products.html">Explore</a></li>
        <li><a href="/orders.html">Orders</a></li>
      </ul>
      <div class="nav-actions">
        <a class="pill pill-outline" href="/cart.html">🛒 <span id="navCartCount">0</span></a>
        <a class="pill pill-outline" href="/wishlist.html">❤️ <span id="navWishCount">0</span></a>
        ${logged ? `<button id="logoutBtn" class="pill pill-primary">Exit</button>` : `<a class="pill pill-primary" href="/login.html">Join</a>`}
      </div>
    </nav>
  `;

  const searchForm = document.getElementById('navSearchForm');
  searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('navSearchInput').value.trim();
    if (q) location.href = `/products.html?q=${encodeURIComponent(q)}`;
  });

  const logout = document.getElementById('logoutBtn');
  if (logout) logout.addEventListener('click', () => { localStorage.removeItem('token'); location.href = '/login.html'; });
  await updateNavCounts();
}

export async function updateNavCounts() {
  const cartEl = document.getElementById('navCartCount');
  const wishEl = document.getElementById('navWishCount');
  if (!cartEl && !wishEl) return;
  if (!isLoggedIn()) {
    if (cartEl) cartEl.textContent = '0';
    if (wishEl) wishEl.textContent = '0';
    return;
  }
  try {
    const [cart, wish] = await Promise.all([fetchJson('/api/cart'), fetchJson('/api/wishlist')]);
    if (cartEl) {
      const count = cart && Array.isArray(cart.items) ? cart.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0) : 0;
      cartEl.textContent = String(count);
    }
    if (wishEl) {
      const count = wish && Array.isArray(wish.items) ? wish.items.length : 0;
      wishEl.textContent = String(count);
    }
  } catch (e) {
    if (cartEl) cartEl.textContent = '0';
    if (wishEl) wishEl.textContent = '0';
  }
}

export function redirectIfNotLoggedIn() {
  if (!isLoggedIn()) location.href = '/login.html';
}

/* Cart / wishlist helpers */
export async function addToCart(productId, quantity = 1) {
  return await fetchJson('/api/cart', { method: 'POST', body: { product_id: productId, quantity } });
}
export async function removeFromWishlist(wishlistId) {
  return await fetchJson(`/api/wishlist/${wishlistId}`, { method: 'DELETE' });
}
export async function moveWishlistToCart(wishlistId, productId, qty = 1) {
  // If productId not provided, fetch from wishlist
  if (!productId) {
    try {
      const wishRes = await fetchJson('/api/wishlist');
      if (wishRes && wishRes.ok && Array.isArray(wishRes.items)) {
        const item = wishRes.items.find(it =>
          String(it.wishlist_id || it.id || it.wishlistId) === String(wishlistId)
        );
        if (item) productId = item.product_id || item.productId || item.id;
      }
    } catch (e) {
      console.error('Error fetching wishlist for productId', e);
    }
  }
  if (!productId) {
    return { ok: false, message: 'Product ID not found in wishlist item' };
  }

  // Add to cart
  const add = await addToCart(productId, qty);
  if (!add || !add.ok) {
    return { ok: false, message: add?.message || 'Failed to add to cart' };
  }

  // Remove from wishlist
  const rem = await removeFromWishlist(wishlistId);
  if (!rem || !rem.ok) {
    // Even if removal fails, item is in cart, so log warning but return success
    console.warn('Added to cart but failed to remove from wishlist:', rem?.message);
    await updateNavCounts();
    return { ok: true, warning: 'Added to cart but may still appear in wishlist' };
  }

  await updateNavCounts();
  return { ok: true };
}

// Try clearing cart via common endpoints; return status
export async function clearCart() {
  try {
    let res = await fetchJson('/api/cart/clear', { method: 'POST' });
    if (res && res.ok) return { ok: true, source: 'cart/clear', res };
    res = await fetchJson('/api/cart', { method: 'DELETE' });
    if (res && res.ok) return { ok: true, source: 'cart:DELETE', res };
    res = await fetchJson('/api/cart', { method: 'POST', body: { items: [] } });
    if (res && res.ok) return { ok: true, source: 'cart:POST-empty', res };
    return { ok: false, message: 'Could not clear cart (no supported endpoint responded OK)' };
  } catch (err) {
    return { ok: false, message: String(err) };
  }
}

/* Orders helpers */
export function saveLatestOrder(order) {
  try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch { }
}
export function getLatestOrder() {
  try { const r = localStorage.getItem(ORDER_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

// Place order using cart (compute total client-side, send payload to server)
export async function placeOrderUsingCart({ address = null, payment_method = 'COD' } = {}) {
  const cart = await fetchJson('/api/cart');
  if (!cart || !cart.ok || !Array.isArray(cart.items) || cart.items.length === 0) {
    return { ok: false, status: 400, message: 'Cart is empty' };
  }
  const items = cart.items || [];
  const total = items.reduce((s, it) => {
    const price = Number(it.price ?? it.product_price ?? 0) || 0;
    const qty = Number(it.quantity ?? it.qty ?? 1) || 1;
    return s + price * qty;
  }, 0);

  if (!address) {
    const prof = await getProfile();
    if (!prof) return { ok: false, status: 401, message: 'Not logged in or profile unavailable' };
    address = prof.address || '';
    if (!address) return { ok: false, status: 422, message: 'No address on profile' };
  }

  const res = await fetchJson('/api/orders/checkout', {
    method: 'POST',
    body: { address, payment_method, total_amount: total }
  });

  if (!res || !res.ok) return Object.assign({ client_total: total }, res || { ok: false, message: 'No response from server' });

  // try clear cart after successful order
  const clearResult = await clearCart();
  return Object.assign({ client_total: total, cart_cleared: clearResult }, res);
}

/* Payments helper */
export async function createPayment(order_id, payment_method, amount = 0, details = {}) {
  const body = { order_id, payment_method, amount, details };
  return await fetchJson('/api/payments', { method: 'POST', body });
}

/* Utilities */
export function formatCurrency(amount) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount || 0)); }