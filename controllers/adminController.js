
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

function adminPage(req, res) {
  const editingProduct = req.query.edit ? getProductById(req.query.edit) : null;
  const isLoggedIn = !!(req.session && req.session.admin);
  res.render('pages/admin', {
    pageTitle: 'Admin',
    loginError: null,
    isLoggedIn,
    products: isLoggedIn ? getProducts() : [],
    orders: isLoggedIn ? getOrders() : [],
    settings: getSettings(),
    editingProduct,
    meta: buildMeta({ title: 'Mawar Parfume — Admin', description: 'Panel admin Mawar Parfume.', canonical: `${res.locals.baseUrl}/admin`, robots: 'noindex, nofollow' })
  });
}

function login(req, res) {
  const id = String(req.body.id || '').trim();
  const password = String(req.body.password || '').trim();
  if (id === String(process.env.ADMIN_ID || '').trim() && password === String(process.env.ADMIN_PASSWORD || '').trim()) {
    req.session.admin = { id, loginAt: new Date().toISOString(), sessionId: crypto.randomUUID() };
    return res.redirect('/admin');
  }
  return res.status(401).render('pages/admin', {
    pageTitle: 'Admin',
    loginError: 'Login gagal. Periksa ADMIN_ID dan ADMIN_PASSWORD.',
    isLoggedIn: false,
    products: [],
    orders: [],
    settings: getSettings(),
    editingProduct: null,
    meta: buildMeta({ title: 'Mawar Parfume — Admin', description: 'Panel admin Mawar Parfume.', canonical: `${res.locals.baseUrl}/admin`, robots: 'noindex, nofollow' })
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
  res.redirect('/admin');
}

function removeProduct(req, res) {
  deleteProduct(req.params.id);
  res.redirect('/admin');
}

function removeOrder(req, res) {
  deleteOrder(req.params.orderCode);
  res.redirect('/admin');
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
  res.redirect('/admin');
}

module.exports = { adminPage, login, logout, saveProduct, removeProduct, removeOrder, updateSettings };
