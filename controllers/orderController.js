const { getProducts, addOrder, generateOrderCode } = require('../helpers/store');
const { sendTelegramMessage } = require('../helpers/telegram');
const { buildMeta } = require('../helpers/seo');

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function checkoutPage(req, res) {
  res.render('pages/checkout', {
    pageTitle: 'Checkout',
    meta: buildMeta({
      title: 'Checkout — Mawar Parfume Poipet',
      description: 'Checkout Mawar Parfume Poipet. Isi data pesanan dan pilih metode pembayaran.',
      canonical: `${res.locals.baseUrl}/checkout`
    })
  });
}

function successPage(req, res) {
  const orderCode = req.query.order || null;

  res.render('pages/success', {
    pageTitle: 'Order Berhasil',
    orderCode,
    messageTitle: 'Order sukses',
    messageText: 'Terima kasih! Pesanan kamu sudah kami terima dan sedang diproses.',
    showHomeOnly: false,
    meta: buildMeta({
      title: 'Order Berhasil • Mawar Parfume',
      description: 'Pesanan berhasil dikirim ke Mawar Parfume.',
      canonical: `${res.locals.baseUrl}/success`,
      robots: 'noindex, nofollow'
    })
  });
}

async function createOrder(req, res) {
  try {
    const products = getProducts();
    const body = req.body || {};
    const customer = body.customer || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const notes = String(body.notes || '').trim();

    const name = String(customer.name || '').trim();
    const phone = String(customer.phone || '').trim();
    const address = String(customer.address || '').trim();

    if (!name || !phone || !address) {
      return res.status(400).json({
        ok: false,
        message: 'Nama, nomor telepon, dan alamat wajib diisi.'
      });
    }

    if (!items.length) {
      return res.status(400).json({
        ok: false,
        message: 'Keranjang kosong.'
      });
    }

    let subtotal = 0;

    const safeItems = items.map((item) => {
      const product = products.find((entry) => String(entry.id) === String(item.id));

      if (!product || !product.active) {
        throw new Error('Produk tidak tersedia.');
      }

      if (product.soldOut) {
        throw new Error(`Produk sold out: ${product.name}`);
      }

      const qty = Math.max(1, Number(item.qty || 1));
      const lineTotal = qty * Number(product.price || 0);
      subtotal += lineTotal;

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price || 0),
        qty,
        lineTotal
      };
    });

    const order = {
      orderCode: generateOrderCode(),
      status: 'NEW',
      createdAt: new Date().toISOString(),
      customer: {
        name,
        phone,
        address
      },
      notes,
      items: safeItems,
      totals: {
        subtotal,
        grandTotal: subtotal
      }
    };

    addOrder(order);

    const itemLines = safeItems
      .map((item) => `• ${item.name} x${item.qty} = <b>${rupiah(item.lineTotal)}</b>`)
      .join('\n');

    await sendTelegramMessage(
      `<b>ORDER BARU MASUK ✅</b>\n` +
      `<b>Kode:</b> <code>${order.orderCode}</code>\n` +
      `<b>Nama:</b> ${name}\n` +
      `<b>Telepon:</b> ${phone}\n` +
      `<b>Alamat:</b> ${address}\n\n` +
      `<b>Item:</b>\n${itemLines}\n\n` +
      `<b>Total:</b> <b>${rupiah(subtotal)}</b>` +
      (notes ? `\n<b>Catatan:</b> ${notes}` : '')
    );

    return res.json({
      ok: true,
      orderCode: order.orderCode,
      redirectTo: `/success?order=${encodeURIComponent(order.orderCode)}`
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message || 'Gagal membuat pesanan.'
    });
  }
}

module.exports = { checkoutPage, successPage, createOrder };
