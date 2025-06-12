const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/userController');

// Profile routes
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// Address routes
router.route('/addresses').post(protect, addAddress);
router.route('/addresses/:id').put(protect, updateAddress).delete(protect, deleteAddress);

module.exports = router;
