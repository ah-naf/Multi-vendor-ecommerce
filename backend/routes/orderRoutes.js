const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrdersByUser,
  getOrderById,
  getOrdersBySeller,
  getSellerOrderById,
  updateOrderStatusBySeller // Ensure this is imported
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware'); // Path to your auth middleware

// @route   POST /api/orders/place
// @desc    Place a new order
// @access  Private
router.post('/place', protect, placeOrder);

// @route   GET /api/orders/my-orders
// @desc    Get logged in user's orders
// @access  Private
router.get('/my-orders', protect, getOrdersByUser);

// @route   GET /api/orders/seller-orders
// @desc    Get orders for the logged-in seller
// @access  Private
router.get('/seller-orders', protect, getOrdersBySeller);

// @route   PUT /api/orders/seller-orders/:orderId
// @desc    Update order status by seller
// @access  Private
// Note: uses :orderId as per task spec for this specific route
router.put('/seller-orders/:orderId', protect, updateOrderStatusBySeller);

// @route   GET /api/orders/seller-orders/:id
// @desc    Get a specific order by ID for the logged-in seller
// @access  Private
// This should come after the more specific PUT route if param names were identical, but here they are :orderId vs :id
// However, standard practice is specific non-parameterized routes first, then parameterized.
// And for same-path parameterized, it depends on router logic, but often order matters less than HTTP method.
router.get('/seller-orders/:id', protect, getSellerOrderById);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
// This needs to be last among GET routes with similar path structure
router.get('/:id', protect, getOrderById);

module.exports = router;
