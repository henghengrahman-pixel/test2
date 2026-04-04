const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.get('/admin', requireAdmin, adminController.dashboardPage);
router.get('/admin.html', (req, res) => res.redirect('/admin'));

router.post('/admin/login', adminController.login);
router.post('/admin/logout', adminController.logout);

router.get('/admin/products', requireAdmin, adminController.productsPage);
router.post('/admin/products/save', requireAdmin, adminController.saveProduct);
router.post('/admin/products/:id/delete', requireAdmin, adminController.removeProduct);

router.get('/admin/orders', requireAdmin, adminController.ordersPage);
router.post('/admin/orders/:orderCode/delete', requireAdmin, adminController.removeOrder);

router.get('/admin/settings', requireAdmin, adminController.settingsPage);
router.post('/admin/settings/save', requireAdmin, adminController.updateSettings);

module.exports = router;
