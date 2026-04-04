const crypto = require('crypto');
const {
  getProducts,
  upsertProduct,
  deleteProduct,
  getOrders,
  deleteOrder,
  getSettings,
  saveSettings,
  getProductById,
  slugify
} = require('../helpers/store');
const { buildMeta } = require('../helpers/seo');

function parseCheckbox(value) {
  return value === 'on' || value === 'true' || value === true;
}

function buildAdminMeta(res, title) {
  return buildMeta({
    title: `${title} — Mawar Parfume Admin`,
    description: 'Panel admin Mawar Parfume.',
    canonical: `${res.locals.baseUrl}/admin`,
    robots: 'noindex, nofollow'
  });
}

function getDashboardStats() {
  const products = getProducts();
  const orders = getOrders();
  const settings = getSettings();

  const activeProducts = products.filter((item) => item.active);
  const soldOutProducts = products.filter((item) => item.soldOut);
  const recentOrders = orders.slice(0, 10);

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + Number(order?.totals?.grandTotal || 0);
  }, 0);

  return {
    products,
    orders,
    settings,
    stats: {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      soldOutProducts: soldOutProducts.length,
      totalOrders: orders.length,
      totalRevenue,
      recentOrders
    }
  };
}

function renderAdmin(res, options = {}) {
  const {
    pageTitle = 'Admin',
    currentTab = 'dashboard',
    loginError = null,
    isLoggedIn = false,
    editingProduct = null
  } = options;

  const { products, orders, settings, stats } = getDashboardStats();

  return res.render('pages/admin', {
    pageTitle,
    loginError,
    isLoggedIn,
    currentTab,
    products: isLoggedIn ? products : [],
    orders: isLoggedIn ? orders : [],
    settings,
    stats: isLoggedIn
      ? stats
      : {
          totalProducts: 0,
          activeProducts: 0,
          soldOutProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          recentOrders: []
        },
    editingProduct,
    meta: buildAdminMeta(res, pageTitle)
  });
}

function adminPage(req, res) {
  const editingProduct = req.query.edit ? getProductById(req.query.edit) : null;
  const isLoggedIn = !!(req.session && req.session.admin);

  return renderAdmin(res, {
    pageTitle: 'Dashboard',
    currentTab: 'dashboard',
    isLoggedIn,
    editingProduct
  });
}

function dashboardPage(req, res) {
  return renderAdmin(res, {
    pageTitle: 'Dashboard',
    currentTab: 'dashboard',
    isLoggedIn: true
  });
}

function productsPage(req, res) {
  const editingProduct = req.query.edit ? getProductById(req.query.edit) : null;

  return renderAdmin(res, {
    pageTitle: 'Products',
    currentTab: 'products',
    isLoggedIn: true,
    editingProduct
  });
}

function ordersPage(req, res) {
  return renderAdmin(res, {
    pageTitle: 'Orders',
    currentTab: 'orders',
    isLoggedIn: true
  });
}

function settingsPage(req, res) {
  return renderAdmin(res, {
    pageTitle: 'Settings',
    currentTab: 'settings',
    isLoggedIn: true
  });
}

function login(req, res) {
  const id = String(req.body.id || '').trim();
  const password = String(req.body.password || '').trim();

  if (
    id === String(process.env.ADMIN_ID || '').trim() &&
    password === String(process.env.ADMIN_PASSWORD || '').trim()
  ) {
    req.session.admin = {
      id,
      loginAt: new Date().toISOString(),
      sessionId: crypto.randomUUID()
    };
    return res.redirect('/admin');
  }

  return renderAdmin(res.status(401), {
    pageTitle: 'Admin Login',
    currentTab: 'login',
    loginError: 'Login gagal. Periksa ADMIN_ID dan ADMIN_PASSWORD.',
    isLoggedIn: false,
    editingProduct: null
  });
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/admin'));
}

function saveProduct(req, res) {
  const body = req.body || {};
  const gallery = String(body.gallery || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  upsertProduct({
    id: body.id || undefined,
    name: body.name,
    slug: body.slug || slugify(body.name),
    price: body.price,
    desc: body.desc,
    description: body.description,
    image: body.image,
    gallery,
    badge: body.badge,
    category: body.category,
    soldOut: parseCheckbox(body.soldOut),
    active: parseCheckbox(body.active),
    topSeller: parseCheckbox(body.topSeller),
    seoTitle: body.seoTitle,
    seoDescription: body.seoDescription,
    canonical: body.canonical,
    ogImage: body.ogImage,
    topNotes: body.topNotes,
    midNotes: body.midNotes,
    baseNotes: body.baseNotes
  });

  return res.redirect('/admin/products');
}

function removeProduct(req, res) {
  deleteProduct(req.params.id);
  return res.redirect('/admin/products');
}

function removeOrder(req, res) {
  deleteOrder(req.params.orderCode);
  return res.redirect('/admin/orders');
}

function updateSettings(req, res) {
  saveSettings({
    appName: req.body.appName,
    footerText: req.body.footerText,
    whatsappLink: req.body.whatsappLink,
    contactPhone: req.body.contactPhone,
    contactEmail: req.body.contactEmail,
    organizationName: req.body.organizationName,
    defaultSeoTitle: req.body.defaultSeoTitle,
    defaultSeoDescription: req.body.defaultSeoDescription,
    defaultOgImage: req.body.defaultOgImage,
    instagramUrl: req.body.instagramUrl,
    tiktokUrl: req.body.tiktokUrl,
    telegramUrl: req.body.telegramUrl
  });

  return res.redirect('/admin/settings');
}

module.exports = {
  adminPage,
  dashboardPage,
  productsPage,
  ordersPage,
  settingsPage,
  login,
  logout,
  saveProduct,
  removeProduct,
  removeOrder,
  updateSettings
};
