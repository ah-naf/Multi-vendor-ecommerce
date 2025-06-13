const express = require('express');
const router = express.Router();
const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  getCartItems,
  clearUserCart, // Added import here
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addToCart);
router.delete('/remove/:productId', protect, removeFromCart);
router.put('/update/:productId', protect, updateCartItemQuantity);
router.get('/', protect, getCartItems);
router.delete('/clear', protect, clearUserCart); // Added new route

module.exports = router;
