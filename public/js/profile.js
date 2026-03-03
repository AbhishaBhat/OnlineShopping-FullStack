import { updateNav, fetchJson, redirectIfNotLoggedIn } from './common.js';

async function loadProfile() {
  try {
    const res = await fetchJson('/api/me');
    const details = document.getElementById('details');
    const nameEl = document.getElementById('name');
    if (!res.ok) {
      nameEl.textContent = 'Profile';
      details.innerHTML = `<p>${res.message || 'Not logged in'}</p>`;
      return;
    }
    const u = res.user || {};
    nameEl.textContent = u.full_name || 'Profile';
    details.innerHTML = `
      <p><strong>Email:</strong> ${u.email || '-'}</p>
      <p><strong>Phone:</strong> ${u.phone || '-'}</p>
      <p><strong>Address:</strong> ${u.address || '-'}</p>
      <p><strong>Role:</strong> ${u.role || '-'}</p>
      <p><small>Member since: ${u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</small></p>
    `;
  } catch (err) {
    document.getElementById('details').innerHTML = `<p>Error loading profile</p>`;
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await updateNav();
  redirectIfNotLoggedIn();
  loadProfile();
});