const express = require('express');
const router = express.Router();
const { placeOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware'); // Path to your auth middleware

// @route   POST /api/orders/place
// @desc    Place a new order
// @access  Private
router.post('/place', protect, placeOrder);

module.exports = router;
