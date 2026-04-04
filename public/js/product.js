
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const image = document.getElementById('pImage');
    document.querySelectorAll('#thumbs .thumb').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('#thumbs .thumb').forEach((node) => node.classList.remove('active'));
        thumb.classList.add('active');
        if (image) image.src = thumb.dataset.image;
      });
    });

    const qty = document.getElementById('qty');
    document.getElementById('minus')?.addEventListener('click', () => {
      qty.value = Math.max(1, Number(qty.value || 1) - 1);
    });
    document.getElementById('plus')?.addEventListener('click', () => {
      qty.value = Math.max(1, Number(qty.value || 1) + 1);
    });
    document.getElementById('addProductCart')?.addEventListener('click', (e) => {
      const button = e.currentTarget;
      window.MawarCart.add({ id: button.dataset.id, name: button.dataset.name, price: button.dataset.price }, Math.max(1, Number(qty.value || 1)));
      window.MawarCart.toggle(true);
    });
  });
})();
