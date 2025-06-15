const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserAddresses,
} = require("../controllers/userController.js");

router.get("/addresses", protect, getUserAddresses);

router.get("/profile", protect, (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: "User not found after authentication" });
  }
});

router.put("/profile", protect, updateUserProfile);

router.post("/addresses", protect, addAddress);

router.put("/addresses/:addressId", protect, updateAddress);

router.delete("/addresses/:addressId", protect, deleteAddress);

router.put("/addresses/:addressId/default", protect, setDefaultAddress);

module.exports = router;
