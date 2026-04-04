
(() => {
  const money = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;
  function renderCheckoutCart() {
    const cartWrap = document.getElementById('cartWrap');
    const grandTotal = document.getElementById('grandTotal');
    if (!cartWrap || !grandTotal || !window.MawarCart) return;
    const cart = window.MawarCart.read();
    if (!cart.length) {
      cartWrap.innerHTML = '<div class="muted">Keranjang masih kosong.</div>';
      grandTotal.textContent = 'Rp 0';
      return;
    }
    let total = 0;
    cartWrap.innerHTML = `<table class="cartTable" style="width:100%;border-collapse:collapse;">${cart.map((item, index) => {
      total += Number(item.price) * Number(item.qty);
      return `<tr><td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.08);">${item.name}</td><td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.08);">${money(item.price)}</td><td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.08);">${item.qty}</td><td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.08);"><button class="iconbtn" style="width:auto;padding:0 10px;" onclick="window.MawarCart.change(${index}, -1)">−</button></td></tr>`;
    }).join('')}</table>`;
    grandTotal.textContent = money(total);
  }

  async function submitOrder(event) {
    event.preventDefault();
    const message = document.getElementById('checkoutMessage');
    const btn = document.getElementById('btnCheckout');
    const cart = window.MawarCart.read();
    if (!cart.length) {
      message.textContent = 'Keranjang kosong.';
      return;
    }
    btn.disabled = true;
    message.textContent = 'Memproses pesanan...';
    try {
      const payload = {
        customer: {
          name: document.getElementById('name').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          address: document.getElementById('address').value.trim()
        },
        notes: document.getElementById('notes').value.trim(),
        items: cart.map((item) => ({ id: item.id, qty: item.qty }))
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Checkout gagal.');
      window.MawarCart.clear();
      location.href = data.redirectTo;
    } catch (error) {
      message.textContent = error.message;
      btn.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutCart();
    document.getElementById('checkoutForm')?.addEventListener('submit', submitOrder);
    document.getElementById('clearCartBtn')?.addEventListener('click', () => {
      window.MawarCart.clear();
      renderCheckoutCart();
    });
  });
  window.renderCheckoutCart = renderCheckoutCart;
})();
