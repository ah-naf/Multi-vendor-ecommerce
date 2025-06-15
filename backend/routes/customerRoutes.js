const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllProducts,
  getProductById,
} = require("../controllers/productController");
const {
  getTotalOrders,
  getWishlistItemsCount,
  getTotalSpent,
  getRecentOrders,
  getActiveOrder,
} = require("../controllers/customerDashboardController");

// Customer Dashboard Routes
// All routes below are protected and authorized for 'customer' role.

router.get(
  "/dashboard/total-orders",
  protect,
  authorize(["customer"]),
  getTotalOrders
);
router.get(
  "/dashboard/wishlist-items-count",
  protect,
  authorize(["customer"]),
  getWishlistItemsCount
);
router.get(
  "/dashboard/total-spent",
  protect,
  authorize(["customer"]),
  getTotalSpent
);
router.get(
  "/dashboard/recent-orders",
  protect,
  authorize(["customer"]),
  getRecentOrders
);
router.get(
  "/dashboard/active-order",
  protect,
  authorize(["customer"]),
  getActiveOrder
);

router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);

module.exports = router;
