document.addEventListener('DOMContentLoaded', async () => {
  try {
    const catRes = await fetch('/api/categories');
    const catJson = await catRes.json();
    const catContainer = document.getElementById('categories');
    if (catJson.categories) {
      catJson.categories.forEach(c => {
        const col = document.createElement('div'); col.className = 'col-md-3';
        col.innerHTML = `<div class="card p-3 text-center"><h6>${c.name}</h6><p class="small text-muted">${c.description || ''}</p><a href="/products.html?category_id=${c.id}" class="stretched-link">View</a></div>`;
        catContainer.appendChild(col);
      });
    }

    const prodRes = await fetch('/api/products');
    const prodJson = await prodRes.json();
    const prodContainer = document.getElementById('products');
    if (prodJson.products) {
      prodJson.products.slice(0, 8).forEach(p => {
        const col = document.createElement('div'); col.className = 'col-md-3';
        col.innerHTML = `<div class="card h-100 p-3"><div class="bg-light mb-3" style="height:140px;display:flex;align-items:center;justify-content:center;">Image</div><h6>${p.name}</h6><p class="text-muted small">₹ ${p.price || 0}</p><a href="/product.html?id=${p.id}" class="btn btn-sm btn-outline-primary">View</a></div>`;
        prodContainer.appendChild(col);
      });
    }
  } catch (err) {
    console.error(err);
  }
});