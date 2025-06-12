// backend/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming authorize checks role

// Import Product Controllers (already there)
const { getAllProducts, getProductById } = require('../controllers/productController');

// Import Payment Controller
const { processPayment } = require('../controllers/PaymentController');

// Import Order Controllers
const { createOrder, getCustomerOrders, getOrderDetails } = require('../controllers/OrderController');

// Dashboard route (already there)
router.get('/dashboard', protect, authorize(['customer', 'seller']), (req, res) => {
  res.json({
    message: 'Welcome to Customer Dashboard',
    data: { // Example data, keep or remove as per actual dashboard logic
      orders: 5,
      wishlistItems: 10,
    },
  });
});

// Product routes for customers (already there)
router.get('/products', getAllProducts); // This can be public or protected based on app logic
router.get('/products/:id', getProductById); // Same as above

// Payment Route for Customers
router.post('/payment/process', protect, authorize(['customer']), processPayment);

// Order Routes for Customers
router.post('/orders', protect, authorize(['customer']), createOrder);
router.get('/orders', protect, authorize(['customer']), getCustomerOrders);
router.get('/orders/:orderId', protect, authorize(['customer']), getOrderDetails);


module.exports = router;
