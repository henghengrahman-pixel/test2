
const { getProducts, getProductBySlug, getSettings } = require('../helpers/store');
const { buildMeta, productSchema } = require('../helpers/seo');

function home(req, res) {
  const settings = getSettings();
  const products = getProducts().filter((item) => item.active);
  res.render('pages/home', {
    pageTitle: settings.appName,
    products,
    meta: buildMeta({
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDescription,
      canonical: settings.canonicalHome || `${res.locals.baseUrl}/`,
      ogImage: settings.defaultOgImage || `${res.locals.baseUrl}/images/og-image.svg`
    })
  });
}

function productDetail(req, res) {
  const product = getProductBySlug(req.params.slug);
  if (!product || !product.active) return res.status(404).redirect('/');
  const relatedProducts = getProducts().filter((item) => item.active && item.id !== product.id).slice(0, 4);
  res.render('pages/product-detail', {
    pageTitle: product.name,
    product,
    relatedProducts,
    meta: buildMeta({
      title: product.seoTitle || `${product.name} - Mawar Parfume`,
      description: product.seoDescription || product.description || product.desc,
      canonical: product.canonical || `${res.locals.baseUrl}/product/${product.slug}`,
      ogImage: product.ogImage || product.image,
      type: 'product'
    }),
    pageSchema: productSchema(product, res.locals.baseUrl)
  });
}

module.exports = { home, productDetail };
