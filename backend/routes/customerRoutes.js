const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

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

module.exports = router;
