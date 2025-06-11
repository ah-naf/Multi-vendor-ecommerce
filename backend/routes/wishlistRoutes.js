const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlistItems,
  clearWishlist, // Import the new controller function
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addToWishlist);
router.delete("/remove/:productId", protect, removeFromWishlist);
router.get("/", protect, getWishlistItems);
// router.delete('/clear', protect, clearWishlist); // Add the new route

module.exports = router;
