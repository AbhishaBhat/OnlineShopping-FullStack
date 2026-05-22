import {
  updateNav,
  fetchJson,
  redirectIfNotLoggedIn,
  formatCurrency,
  showToast
} from './common.js';

const blank = value => {
  if (value === null || value === undefined || String(value).trim() === '') return 'Not added yet';
  return String(value);
};

const escapeHtml = value => blank(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

const formatDate = value => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const initials = name => {
  const parts = String(name || 'User').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U';
};

function detail(label, value) {
  return `
    <div class="profile-detail-item">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderProfile(user) {
  const name = user.full_name || 'Happy Shopping User';
  document.getElementById('profileAvatar').textContent = initials(name);
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = blank(user.email);
  document.getElementById('profileRole').textContent = user.role || 'user';
  document.getElementById('accountStatus').textContent = user.status || 'Active';
  document.getElementById('memberSince').textContent = user.created_at
    ? `Member since ${formatDate(user.created_at)}`
    : 'Member since date not available';
  document.getElementById('addressInput').value = user.address || '';

  document.getElementById('profileDetails').innerHTML = [
    detail('Full name', user.full_name),
    detail('Email address', user.email),
    detail('Phone number', user.phone),
    detail('User ID', user.user_id),
    detail('Role', user.role),
    detail('Status', user.status),
    detail('Last login', formatDate(user.last_login)),
    detail('Account created', formatDate(user.created_at))
  ].join('');
}

function renderRecentOrders(orders) {
  const recentOrders = document.getElementById('recentOrders');
  const ordersCount = document.getElementById('ordersCount');
  const latestOrder = document.getElementById('latestOrder');

  ordersCount.textContent = String(orders.length);

  if (!orders.length) {
    latestOrder.textContent = 'No orders placed yet';
    recentOrders.innerHTML = `
      <div class="empty-state">
        You have not placed any orders yet. Start shopping and your order updates will appear here.
      </div>
    `;
    return;
  }

  const newest = orders[0];
  latestOrder.textContent = `Latest #${newest.order_id} on ${formatDate(newest.order_date)}`;
  recentOrders.innerHTML = orders.slice(0, 3).map(order => `
    <div class="list-row">
      <div>
        <strong>Order #${escapeHtml(order.order_id)}</strong>
        <small>${escapeHtml(formatDate(order.order_date))} - ${(order.items || []).length} item type(s)</small>
      </div>
      <div class="profile-order-meta">
        <span class="badge">${escapeHtml(order.order_status || 'PLACED')}</span>
        <strong>${escapeHtml(formatCurrency(order.total_amount))}</strong>
      </div>
    </div>
  `).join('');
}

async function loadProfile() {
  const res = await fetchJson('/api/me');
  if (!res.ok) {
    document.getElementById('profileDetails').innerHTML = `<div class="notice">${escapeHtml(res.message || 'Profile not found')}</div>`;
    return;
  }
  renderProfile(res.user || {});
}

async function loadActivity() {
  const [ordersRes, cartRes, wishlistRes] = await Promise.all([
    fetchJson('/api/orders'),
    fetchJson('/api/cart'),
    fetchJson('/api/wishlist')
  ]);

  const cartItems = Array.isArray(cartRes.items) ? cartRes.items : [];
  const wishlistItems = Array.isArray(wishlistRes.items) ? wishlistRes.items : [];
  document.getElementById('cartCount').textContent = String(
    cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  );
  document.getElementById('wishlistCount').textContent = String(wishlistItems.length);

  if (ordersRes.ok) {
    renderRecentOrders(ordersRes.orders || []);
  } else {
    document.getElementById('ordersCount').textContent = '0';
    document.getElementById('latestOrder').textContent = 'Could not load orders';
    document.getElementById('recentOrders').innerHTML = `<div class="notice">${escapeHtml(ordersRes.message || 'Could not load orders')}</div>`;
  }
}

function bindAddressForm() {
  const form = document.getElementById('addressForm');
  const status = document.getElementById('addressStatus');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.className = 'form-status status-info';
    status.textContent = 'Saving address...';

    const address = document.getElementById('addressInput').value.trim();
    const res = await fetchJson('/api/me/address', { method: 'PUT', body: { address } });

    if (!res.ok) {
      status.className = 'form-status status-error';
      status.textContent = res.message || 'Could not save address.';
      showToast(status.textContent, 'error');
      return;
    }

    status.className = 'form-status status-success';
    status.textContent = 'Address saved successfully.';
    showToast('Address saved successfully.', 'success');
    await loadProfile();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await updateNav();
  if (!redirectIfNotLoggedIn()) return;
  bindAddressForm();
  await loadProfile();
  await loadActivity();
});
