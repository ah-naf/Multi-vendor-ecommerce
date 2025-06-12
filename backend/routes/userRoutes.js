const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/userController.js');

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

// PUT /profile - Protected route for updating user profile
router.put('/profile', protect, updateUserProfile);

// POST /addresses - Protected route for adding a new address
router.post('/addresses', protect, addAddress);

// PUT /addresses/:addressId - Protected route for updating an existing address
router.put('/addresses/:addressId', protect, updateAddress);

// DELETE /addresses/:addressId - Protected route for deleting an address
router.delete('/addresses/:addressId', protect, deleteAddress);

// PUT /addresses/:addressId/default - Protected route for setting an address as default
router.put('/addresses/:addressId/default', protect, setDefaultAddress);

module.exports = router;
