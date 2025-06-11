const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /dashboard - Protected and Seller-authorized route
router.get('/dashboard', protect, authorize(['seller']), (req, res) => {
  res.json({
    message: 'Welcome to Seller Dashboard',
    data: {
      sales: 100, // Example data
      products: 50, // Example data
    },
  });
});

module.exports = router;
