const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllProducts, getProductById } = require('../controllers/productController');

// GET /dashboard - Protected and Customer-authorized route
router.get('/dashboard', protect, authorize(['customer']), (req, res) => {
  res.json({
    message: 'Welcome to Customer Dashboard',
    data: {
      orders: 5, // Example data
      wishlistItems: 10, // Example data
    },
  });
});

// Product routes for customers
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);

module.exports = router;
