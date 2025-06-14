const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllProducts, getProductById } = require('../controllers/productController');
const {
  getTotalOrders,
  getWishlistItemsCount,
  getTotalSpent,
  getRecentOrders,
  getActiveOrder,
} = require('../controllers/customerDashboardController');

// Customer Dashboard Routes
// All routes below are protected and authorized for 'customer' role.

router.get('/dashboard/total-orders', protect, authorize(['customer']), getTotalOrders);
router.get('/dashboard/wishlist-items-count', protect, authorize(['customer']), getWishlistItemsCount);
router.get('/dashboard/total-spent', protect, authorize(['customer']), getTotalSpent);
router.get('/dashboard/recent-orders', protect, authorize(['customer']), getRecentOrders); // e.g. /api/customer/dashboard/recent-orders?limit=3
router.get('/dashboard/active-order', protect, authorize(['customer']), getActiveOrder);


// Existing Product routes for customers (can remain as they are if not conflicting)
router.get('/products', getAllProducts); // This might need protect/authorize depending on app requirements
router.get('/products/:id', getProductById); // This might need protect/authorize

module.exports = router;
