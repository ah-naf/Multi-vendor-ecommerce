const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getSellerProductById, // Import the new controller function
  upload, // Import the multer upload middleware
} = require("../controllers/productController");
const { updateOrderStatusBySeller } = require("../controllers/orderController");
const Product = require("../models/Product"); // Assuming the Product model path

// GET /dashboard - Protected and Seller-authorized route
router.get("/dashboard", protect, authorize(["seller"]), (req, res) => {
  res.json({
    message: "Welcome to Seller Dashboard",
    data: {
      sales: 100, // Example data
      products: 50, // Example data
    },
  });
});

// Product Management Routes
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
  .get(protect, authorize(["seller"]), getSellerProductById) // Add GET route for single product
  .put(
    protect,
    authorize(["seller"]),
    upload.array("images", 10),
    updateProduct
  )
  .delete(protect, authorize(["seller"]), deleteProduct);

// Order Management Routes
router
  .route("/orders/:orderId/status")
  .put(protect, authorize(["seller"]), updateOrderStatusBySeller);

module.exports = router;
