async function postJSON(url, data) {
  const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
  return res.json();
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const r = await postJSON('/api/auth/login', { email, password });
      if (r.ok) {
        localStorage.setItem('token', r.token);
        if (r.role === 'admin') location.href = '/admin.html';
        else location.href = '/profile.html';
      } else alert(r.message || 'Login failed');
    });
  }

  const reg = document.getElementById('registerForm');
  if (reg) {
    reg.addEventListener('submit', async (e) => {
      e.preventDefault();
      const full_name = document.getElementById('full_name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const address = document.getElementById('address').value;
      const password = document.getElementById('password').value;
      const r = await postJSON('/api/auth/register', { full_name, email, phone, address, password });
      if (r.ok) { alert('Registered. Please login.'); location.href = '/login.html'; }
      else alert(r.message || 'Register failed');
    });
  }
});