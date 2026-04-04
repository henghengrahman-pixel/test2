
const express = require('express');
const router = express.Router();
const { getProducts } = require('../helpers/store');

router.get('/robots.txt', (req, res) => {
  const baseUrl = res.locals.baseUrl;
  res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', (req, res) => {
  const baseUrl = res.locals.baseUrl;
  const products = getProducts().filter((item) => item.active);
  const urls = [`${baseUrl}/`, `${baseUrl}/checkout`, ...products.map((item) => `${baseUrl}/product/${item.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url, index) => `  <url>\n    <loc>${url}</loc>\n    <changefreq>${index === 0 ? 'daily' : 'weekly'}</changefreq>\n    <priority>${index === 0 ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n')}\n</urlset>`;
  res.type('application/xml').send(xml);
});

module.exports = router;
