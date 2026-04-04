
function buildMeta({
  title = 'Mawar Parfume',
  description = '',
  canonical = '',
  ogImage = '',
  type = 'website',
  robots = 'index, follow'
} = {}) {
  return {
    title,
    description,
    canonical,
    ogImage,
    type,
    robots,
    twitterCard: 'summary_large_image'
  };
}

function organizationSchema(settings, baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.organizationName || settings.appName,
    url: baseUrl,
    logo: settings.defaultOgImage || `${baseUrl}/images/og-image.svg`,
    sameAs: [settings.instagramUrl, settings.tiktokUrl, settings.telegramUrl].filter(Boolean),
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: settings.contactPhone,
      email: settings.contactEmail,
      contactType: 'customer service'
    }]
  };
}

function productSchema(product, baseUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.gallery && product.gallery.length ? product.gallery : [product.image],
    description: product.seoDescription || product.description || product.desc,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Mawar Parfume'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: product.price,
      availability: product.soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${baseUrl}/product/${product.slug}`
    }
  };
}

module.exports = { buildMeta, organizationSchema, productSchema };
