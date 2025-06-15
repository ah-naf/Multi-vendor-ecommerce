const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getSellerProductById,
  upload,
} = require("../controllers/productController");
const { updateOrderStatusBySeller } = require("../controllers/orderController");
const {
  getSalesData,
  getSalesPerformance,
  getOrderStatusCounts,
  getRevenueTrendData,
  getLowStockProductCount,
} = require("../controllers/sellerDashboardController");

// Seller Dashboard Routes
router.get(
  "/dashboard/sales-data",
  protect,
  authorize(["seller"]),
  getSalesData
);
router.get(
  "/dashboard/sales-performance",
  protect,
  authorize(["seller"]),
  getSalesPerformance
);
router.get(
  "/dashboard/order-status-counts",
  protect,
  authorize(["seller"]),
  getOrderStatusCounts
);
router.get(
  "/dashboard/revenue-trend",
  protect,
  authorize(["seller"]),
  getRevenueTrendData
);
router.get(
  "/dashboard/low-stock-count",
  protect,
  authorize(["seller"]),
  getLowStockProductCount
);

router
  .route("/products")
  .post(
    protect,
    authorize(["seller"]),
    upload.array("images", 10),
    createProduct
  )
  .get(protect, authorize(["seller"]), getSellerProducts);

router
  .route("/products/:id")
  .get(protect, authorize(["seller"]), getSellerProductById)
  .put(
    protect,
    authorize(["seller"]),
    upload.array("images", 10),
    updateProduct
  )
  .delete(protect, authorize(["seller"]), deleteProduct);

router
  .route("/orders/:orderId/status")
  .put(protect, authorize(["seller"]), updateOrderStatusBySeller);

module.exports = router;
