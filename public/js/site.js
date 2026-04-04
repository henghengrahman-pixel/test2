
(() => {
  const CART_KEY = 'mp_cart';
  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  };
  const writeCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const countCart = (cart) => cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const money = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

  function renderCart() {
    const cart = readCart();
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = String(countCart(cart));
    const wrap = document.getElementById('cartDrawerItems');
    if (!wrap) return;
    if (!cart.length) {
      wrap.innerHTML = '<div class="muted">Keranjang masih kosong.</div>';
      return;
    }
    wrap.innerHTML = cart.map((item, index) => `
      <div style="display:grid;grid-template-columns:1fr auto;gap:8px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08);">
        <div><strong style="color:#fff4d6;">${item.name}</strong><div class="muted">${money(item.price)} x ${item.qty}</div></div>
        <div style="display:flex;gap:6px;align-items:center;">
          <button class="iconbtn" style="width:32px;height:32px;" onclick="window.MawarCart.change(${index}, -1)">−</button>
          <button class="iconbtn" style="width:32px;height:32px;" onclick="window.MawarCart.change(${index}, 1)">+</button>
        </div>
      </div>`).join('');
  }

  function add(item, qty = 1) {
    const cart = readCart();
    const existing = cart.find((entry) => entry.id === item.id);
    if (existing) existing.qty += qty;
    else cart.push({ id: item.id, name: item.name, price: Number(item.price), qty });
    writeCart(cart);
    renderCart();
  }

  function change(index, diff) {
    const cart = readCart();
    if (!cart[index]) return;
    cart[index].qty += diff;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    writeCart(cart);
    renderCart();
    if (window.renderCheckoutCart) window.renderCheckoutCart();
  }

  function clear() {
    writeCart([]);
    renderCart();
    if (window.renderCheckoutCart) window.renderCheckoutCart();
  }

  function toggle(force) {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;
    const next = typeof force === 'boolean' ? force : drawer.style.display !== 'block';
    drawer.style.display = next ? 'block' : 'none';
    document.body.classList.toggle('cart-open', next);
    renderCart();
  }

  function initFilters() {
    const q = document.getElementById('q');
    const grid = document.getElementById('productsGrid');
    if (!q || !grid) return;
    const resultInfo = document.getElementById('resultInfo');
    const cards = [...grid.querySelectorAll('.product-card')];
    const apply = () => {
      const keyword = q.value.toLowerCase().trim();
      let visible = 0;
      cards.forEach((card) => {
        const text = `${card.dataset.name} ${card.dataset.category} ${card.dataset.badge}`.toLowerCase();
        const show = !keyword || text.includes(keyword);
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      if (resultInfo) resultInfo.textContent = `${visible} produk tampil`;
    };
    q.addEventListener('input', apply);
    document.querySelectorAll('.cat-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (!grid) return;
        e.preventDefault();
        q.value = link.dataset.filter || '';
        apply();
      });
    });
  }

  function initSearch() {
    const overlay = document.getElementById('searchOverlay');
    const openBtn = document.getElementById('openSearchBtn');
    const closeBtn = document.getElementById('closeSearchBtn');
    if (!overlay || !openBtn || !closeBtn) return;
    openBtn.addEventListener('click', () => overlay.classList.add('active'));
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  }

  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mainNav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('.add-cart');
    if (!target) return;
    add({ id: target.dataset.id, name: target.dataset.name, price: target.dataset.price }, 1);
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    initFilters();
    initSearch();
    initMobileMenu();
  });

  window.MawarCart = { add, clear, toggle, change, read: readCart, render: renderCart };
})();
