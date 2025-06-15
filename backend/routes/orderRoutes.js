const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getOrdersByUser,
  getOrderById,
  getOrdersBySeller,
  getSellerOrderById,
  updateOrderStatusBySeller,
  requestOrderCancellationByCustomer,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.post("/place", protect, placeOrder);

router.get("/my-orders", protect, getOrdersByUser);

router.get("/seller-orders", protect, getOrdersBySeller);

router.put("/seller-orders/:orderId", protect, updateOrderStatusBySeller);

router.get("/seller-orders/:id", protect, getSellerOrderById);

router.get("/:id", protect, getOrderById);

router.put(
  "/:orderId/cancel-by-customer",
  protect,
  requestOrderCancellationByCustomer
);

module.exports = router;
