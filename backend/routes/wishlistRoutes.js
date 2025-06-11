const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlistItems,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addToWishlist);
router.delete('/remove/:productId', protect, removeFromWishlist);
router.get('/', protect, getWishlistItems);

module.exports = router;
