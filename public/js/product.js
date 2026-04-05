(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const image = document.getElementById('pImage');
    const thumbs = document.querySelectorAll('#thumbs .thumb');
    const qty = document.getElementById('qty');
    const minusBtn = document.getElementById('minus');
    const plusBtn = document.getElementById('plus');
    const addToCartBtn = document.getElementById('addProductCart');
    const buyNowBtn = document.getElementById('buyNowBtn');

    function getQtyValue() {
      if (!qty) return 1;
      return Math.max(1, Number(qty.value || 1));
    }

    function setQtyValue(value) {
      if (!qty) return;
      qty.value = Math.max(1, Number(value || 1));
    }

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        thumbs.forEach((node) => node.classList.remove('active'));
        thumb.classList.add('active');

        if (image && thumb.dataset.image) {
          image.src = thumb.dataset.image;
        }
      });
    });

    minusBtn?.addEventListener('click', () => {
      setQtyValue(getQtyValue() - 1);
    });

    plusBtn?.addEventListener('click', () => {
      setQtyValue(getQtyValue() + 1);
    });

    qty?.addEventListener('input', () => {
      const cleanValue = String(qty.value || '').replace(/[^\d]/g, '');
      qty.value = cleanValue;

      if (!qty.value || Number(qty.value) < 1) {
        qty.value = 1;
      }
    });

    qty?.addEventListener('blur', () => {
      setQtyValue(getQtyValue());
    });

    addToCartBtn?.addEventListener('click', (e) => {
      const button = e.currentTarget;

      if (!window.MawarCart || typeof window.MawarCart.add !== 'function') {
        console.error('MawarCart is not available.');
        alert('Keranjang belum siap. Coba refresh halaman.');
        return;
      }

      window.MawarCart.add(
        {
          id: button.dataset.id,
          name: button.dataset.name,
          price: button.dataset.price
        },
        getQtyValue()
      );

      if (typeof window.MawarCart.toggle === 'function') {
        window.MawarCart.toggle(true);
      }
    });

    buyNowBtn?.addEventListener('click', (e) => {
      const button = e.currentTarget;

      if (!window.MawarCart || typeof window.MawarCart.add !== 'function') {
        console.error('MawarCart is not available.');
        alert('Keranjang belum siap. Coba refresh halaman.');
        return;
      }

      window.MawarCart.add(
        {
          id: button.dataset.id,
          name: button.dataset.name,
          price: button.dataset.price
        },
        getQtyValue()
      );

      window.location.href = '/checkout';
    });
  });
})();
