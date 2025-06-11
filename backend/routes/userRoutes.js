const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// GET /profile - Protected route
router.get('/profile', protect, (req, res) => {
  // req.user is populated by the protect middleware
  if (req.user) {
    res.json(req.user);
  } else {
    // This case should ideally be handled by the protect middleware itself
    // but as a fallback:
    res.status(404).json({ message: 'User not found after authentication' });
  }
});

module.exports = router;
