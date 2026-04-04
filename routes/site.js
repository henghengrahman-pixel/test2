
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const { getProducts } = require('../helpers/store');

router.get('/', productController.home);
router.get('/index.html', (req, res) => res.redirect('/'));
router.get('/checkout', orderController.checkoutPage);
router.get('/checkout.html', (req, res) => res.redirect('/checkout'));
router.get('/success', orderController.successPage);
router.get('/success.html', (req, res) => res.redirect('/success'));
router.get('/product/:slug', productController.productDetail);
router.get('/product.html', (req, res) => {
  const first = getProducts().find((item) => item.active);
  if (!first) return res.redirect('/');
  return res.redirect(`/product/${first.slug}`);
});
router.post('/api/orders', orderController.createOrder);
router.get('/api/products', (req, res) => {
  const products = getProducts().filter((item) => item.active);
  res.json({ ok: true, products });
});

module.exports = router;
