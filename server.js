
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const siteRoutes = require('./routes/site');
const adminRoutes = require('./routes/admin');
const systemRoutes = require('./routes/system');
const { ensureStore, getSettings } = require('./helpers/store');
const { buildMeta, organizationSchema } = require('./helpers/seo');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

ensureStore();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

app.use((req, res, next) => {
  const settings = getSettings();
  res.locals.baseUrl = BASE_URL;
  res.locals.appName = settings.appName;
  res.locals.siteSettings = settings;
  res.locals.currentPath = req.path;
  res.locals.isAdmin = !!(req.session && req.session.admin);
  res.locals.meta = buildMeta({
    title: settings.defaultSeoTitle,
    description: settings.defaultSeoDescription,
    canonical: `${BASE_URL}${req.path === '/' ? '' : req.path}`,
    ogImage: settings.defaultOgImage || `${BASE_URL}/images/og-image.svg`,
    type: 'website'
  });
  res.locals.pageSchema = null;
  res.locals.orgSchemaJson = JSON.stringify(organizationSchema(settings, BASE_URL));
  next();
});

app.use('/', systemRoutes);
app.use('/', siteRoutes);
app.use('/', adminRoutes);

app.use((req, res) => {
  res.status(404).render('pages/success', {
    layout: 'layouts/main',
    pageTitle: 'Halaman Tidak Ditemukan',
    messageTitle: 'Halaman tidak ditemukan',
    messageText: 'Link yang kamu buka tidak tersedia.',
    orderCode: null,
    showHomeOnly: true,
    meta: buildMeta({
      title: '404 - Halaman Tidak Ditemukan',
      description: 'Halaman tidak ditemukan.',
      canonical: `${BASE_URL}${req.path}`,
      robots: 'noindex, nofollow'
    })
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
