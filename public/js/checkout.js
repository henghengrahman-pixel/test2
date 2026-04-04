(() => {
  const money = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

  function getCartItems() {
    if (window.MawarCart && Array.isArray(window.MawarCart.items)) {
      return window.MawarCart.items;
    }

    try {
      return JSON.parse(localStorage.getItem('mawar_cart_v1')) || [];
    } catch (error) {
      return [];
    }
  }

  function renderCheckoutCart() {
    const cartWrap = document.getElementById('cartWrap');
    const grandTotal = document.getElementById('grandTotal');

    if (!cartWrap || !grandTotal) return;

    const cart = getCartItems();

    if (!cart.length) {
      cartWrap.innerHTML = '<div class="muted">Keranjang masih kosong.</div>';
      grandTotal.textContent = 'Rp 0';
      return;
    }

    let total = 0;

    cartWrap.innerHTML = `
      <table class="cartTable" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px 8px;">Produk</th>
            <th style="text-align:left;padding:10px 8px;">Harga</th>
            <th style="text-align:left;padding:10px 8px;">Qty</th>
            <th style="text-align:left;padding:10px 8px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${cart.map((item, index) => {
            total += Number(item.price || 0) * Number(item.qty || 0);

            return `
              <tr>
                <td style="padding:10px 8px;border-bottom:1px solid rgba(0,0,0,.08);">
                  ${item.name}
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid rgba(0,0,0,.08);">
                  ${money(item.price)}
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid rgba(0,0,0,.08);">
                  ${item.qty}
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid rgba(0,0,0,.08);display:flex;gap:6px;flex-wrap:wrap;">
                  <button
                    class="iconbtn"
                    style="width:auto;padding:0 10px;"
                    type="button"
                    onclick="window.changeCheckoutQty(${index}, -1)"
                  >
                    −
                  </button>

                  <button
                    class="iconbtn"
                    style="width:auto;padding:0 10px;"
                    type="button"
                    onclick="window.changeCheckoutQty(${index}, 1)"
                  >
                    +
                  </button>

                  <button
                    class="iconbtn"
                    style="width:auto;padding:0 10px;"
                    type="button"
                    onclick="window.removeCheckoutItem(${index})"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    grandTotal.textContent = money(total);
  }

  function changeCheckoutQty(index, delta) {
    if (!window.MawarCart || typeof window.MawarCart.changeQty !== 'function') return;

    window.MawarCart.changeQty(index, delta);
    renderCheckoutCart();
  }

  function removeCheckoutItem(index) {
    if (!window.MawarCart || typeof window.MawarCart.remove !== 'function') return;

    window.MawarCart.remove(index);
    renderCheckoutCart();
  }

  async function submitOrder(event) {
    event.preventDefault();

    const message = document.getElementById('checkoutMessage');
    const btn = document.getElementById('btnCheckout');
    const cart = getCartItems();

    if (message) message.textContent = '';

    if (!cart.length) {
      if (message) message.textContent = 'Keranjang kosong.';
      return;
    }

    const name = document.getElementById('name')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const address = document.getElementById('address')?.value.trim();
    const notes = document.getElementById('notes')?.value.trim();

    if (!name || !phone || !address) {
      if (message) message.textContent = 'Nama, nomor telepon, dan alamat wajib diisi.';
      return;
    }

    if (btn) btn.disabled = true;
    if (message) message.textContent = 'Memproses pesanan...';

    try {
      const payload = {
        customer: {
          name,
          phone,
          address
        },
        notes,
        items: cart.map((item) => ({
          id: item.id,
          qty: item.qty
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Checkout gagal.');
      }

      if (window.MawarCart && typeof window.MawarCart.clear === 'function') {
        window.MawarCart.clear();
      } else {
        localStorage.removeItem('mawar_cart_v1');
      }

      location.href = data.redirectTo || '/success';
    } catch (error) {
      if (message) {
        message.textContent = error.message || 'Terjadi kesalahan saat checkout.';
      }

      if (btn) btn.disabled = false;
      return;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutCart();

    document.getElementById('checkoutForm')?.addEventListener('submit', submitOrder);

    document.getElementById('clearCartBtn')?.addEventListener('click', () => {
      if (window.MawarCart && typeof window.MawarCart.clear === 'function') {
        window.MawarCart.clear();
      } else {
        localStorage.removeItem('mawar_cart_v1');
      }

      renderCheckoutCart();

      const message = document.getElementById('checkoutMessage');
      if (message) message.textContent = 'Keranjang berhasil dikosongkan.';
    });
  });

  window.renderCheckoutCart = renderCheckoutCart;
  window.changeCheckoutQty = changeCheckoutQty;
  window.removeCheckoutItem = removeCheckoutItem;
})();
