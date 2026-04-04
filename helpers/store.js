
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[_\s-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `produk-${Date.now()}`;
}

function generateOrderCode() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `MWR-${y}${m}${d}-${rand}`;
}

function defaultSettings() {
  const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  return {
    appName: 'Mawar Parfume',
    footerText: 'Extrait de parfum halal, elegan, dan tahan lama.',
    whatsappLink: 'https://wa.me/6280000000000',
    contactPhone: '+62 800-0000-0000',
    contactEmail: 'admin@mawarparfume.com',
    organizationName: 'Mawar Parfume',
    defaultSeoTitle: 'Parfume Poipet — Mawar Parfume | Extrait de Parfum Halal, Wangi Mewah & Tahan Lama',
    defaultSeoDescription: 'Mawar Parfume Poipet adalah toko parfum Poipet dengan parfum tahan lama, extrait de parfum halal tanpa alkohol, wangi mewah untuk pria dan wanita di Poipet.',
    defaultOgImage: `${baseUrl}/images/og-image.svg`,
    canonicalHome: `${baseUrl}/`,
    instagramUrl: '',
    tiktokUrl: '',
    telegramUrl: ''
  };
}

function seedProducts() {
  return [
    {
      id: crypto.randomUUID(),
      name: 'ROSE OUD',
      slug: 'rose-oud',
      price: 150000,
      desc: 'Spicy • Warm • Luxury',
      description: 'Rose Oud menghadirkan karakter wangi mewah dengan perpaduan mawar, oud, dan sentuhan hangat yang tahan lama.',
      image: 'https://via.placeholder.com/900x1200.png?text=ROSE+OUD',
      gallery: [
        'https://via.placeholder.com/900x1200.png?text=ROSE+OUD',
        'https://via.placeholder.com/900x1200.png?text=ROSE+OUD+2',
        'https://via.placeholder.com/900x1200.png?text=ROSE+OUD+3'
      ],
      badge: 'BESTSELLER',
      category: 'UNISEX',
      soldOut: false,
      active: true,
      topSeller: true,
      seoTitle: 'Rose Oud - Mawar Parfume Poipet',
      seoDescription: 'Rose Oud Mawar Parfume Poipet, extrait de parfum unisex, mewah, tahan lama, dan elegan.',
      canonical: '',
      ogImage: '',
      topNotes: 'Rose, Saffron',
      midNotes: 'Oud, Amber',
      baseNotes: 'Musk, Vanilla',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'ROSE VANILLA',
      slug: 'rose-vanilla',
      price: 175000,
      desc: 'Sweet • Cozy • Elegant',
      description: 'Rose Vanilla cocok untuk pencinta aroma manis lembut, feminin, dan berkesan premium.',
      image: 'https://via.placeholder.com/900x1200.png?text=ROSE+VANILLA',
      gallery: [
        'https://via.placeholder.com/900x1200.png?text=ROSE+VANILLA',
        'https://via.placeholder.com/900x1200.png?text=ROSE+VANILLA+2',
        'https://via.placeholder.com/900x1200.png?text=ROSE+VANILLA+3'
      ],
      badge: 'REFILLABLE',
      category: 'WOMEN',
      soldOut: false,
      active: true,
      topSeller: false,
      seoTitle: 'Rose Vanilla - Mawar Parfume Poipet',
      seoDescription: 'Rose Vanilla Mawar Parfume Poipet dengan aroma manis, cozy, elegan, dan tahan lama.',
      canonical: '',
      ogImage: '',
      topNotes: 'Pear, Rose',
      midNotes: 'Vanilla, Floral',
      baseNotes: 'Musk, Tonka',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

function writeJson(file, data) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function readJson(file, fallback) {
  ensureDir();
  if (!fs.existsSync(file)) {
    writeJson(file, fallback);
    return fallback;
  }
  try {
    const raw = fs.readFileSync(file, 'utf8').trim();
    if (!raw) {
      writeJson(file, fallback);
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    writeJson(file, fallback);
    return fallback;
  }
}

function normalizeProduct(item = {}) {
  const now = new Date().toISOString();
  const name = String(item.name || '').trim().toUpperCase();
  const slug = slugify(item.slug || item.name || 'produk');
  const gallery = Array.isArray(item.gallery)
    ? item.gallery.filter(Boolean)
    : String(item.gallery || '')
        .split(/\r?\n|,/) 
        .map((v) => v.trim())
        .filter(Boolean);
  const image = String(item.image || gallery[0] || 'https://via.placeholder.com/900x1200.png?text=MAWAR+PARFUME').trim();
  return {
    id: String(item.id || crypto.randomUUID()),
    name,
    slug,
    price: Math.max(0, Number(item.price || 0)),
    desc: String(item.desc || '').trim(),
    description: String(item.description || '').trim(),
    image,
    gallery: gallery.length ? gallery : [image],
    badge: String(item.badge || '').trim().toUpperCase(),
    category: String(item.category || 'UNISEX').trim().toUpperCase(),
    soldOut: Boolean(item.soldOut),
    active: item.active !== false,
    topSeller: Boolean(item.topSeller),
    seoTitle: String(item.seoTitle || `${name} - Mawar Parfume`).trim(),
    seoDescription: String(item.seoDescription || item.desc || '').trim(),
    canonical: String(item.canonical || '').trim(),
    ogImage: String(item.ogImage || image).trim(),
    topNotes: String(item.topNotes || '').trim(),
    midNotes: String(item.midNotes || '').trim(),
    baseNotes: String(item.baseNotes || '').trim(),
    createdAt: item.createdAt || now,
    updatedAt: now
  };
}

function ensureStore() {
  ensureDir();
  readJson(PRODUCTS_FILE, seedProducts());
  readJson(ORDERS_FILE, []);
  readJson(SETTINGS_FILE, defaultSettings());
}

function getProducts() {
  const list = readJson(PRODUCTS_FILE, seedProducts());
  if (!Array.isArray(list) || list.length === 0) {
    const seeded = seedProducts();
    writeJson(PRODUCTS_FILE, seeded);
    return seeded.map(normalizeProduct);
  }
  return list.map(normalizeProduct);
}

function saveProducts(products) {
  writeJson(PRODUCTS_FILE, products.map(normalizeProduct));
}

function getProductBySlug(slug) {
  return getProducts().find((item) => item.slug === slug);
}

function getProductById(id) {
  return getProducts().find((item) => item.id === id);
}

function upsertProduct(input) {
  const list = getProducts();
  const normalized = normalizeProduct(input);
  const existingIndex = list.findIndex((item) => item.id === normalized.id);
  const duplicateSlugIndex = list.findIndex((item) => item.slug === normalized.slug && item.id !== normalized.id);
  if (duplicateSlugIndex >= 0) normalized.slug = `${normalized.slug}-${normalized.id.slice(0, 5)}`;
  if (existingIndex >= 0) list[existingIndex] = { ...list[existingIndex], ...normalized, createdAt: list[existingIndex].createdAt };
  else list.unshift(normalized);
  saveProducts(list);
  return normalized;
}

function deleteProduct(id) {
  const filtered = getProducts().filter((item) => item.id !== id);
  saveProducts(filtered);
}

function getOrders() {
  return readJson(ORDERS_FILE, []);
}

function saveOrders(orders) {
  writeJson(ORDERS_FILE, orders);
}

function addOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

function deleteOrder(orderCode) {
  saveOrders(getOrders().filter((item) => item.orderCode !== orderCode));
}

function getSettings() {
  return { ...defaultSettings(), ...readJson(SETTINGS_FILE, defaultSettings()) };
}

function saveSettings(payload) {
  const next = { ...getSettings(), ...payload };
  writeJson(SETTINGS_FILE, next);
  return next;
}

module.exports = {
  DATA_DIR,
  PRODUCTS_FILE,
  ORDERS_FILE,
  SETTINGS_FILE,
  ensureStore,
  slugify,
  generateOrderCode,
  getProducts,
  saveProducts,
  getProductBySlug,
  getProductById,
  upsertProduct,
  deleteProduct,
  getOrders,
  addOrder,
  deleteOrder,
  getSettings,
  saveSettings,
  normalizeProduct
};
