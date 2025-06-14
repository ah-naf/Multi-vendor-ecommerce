// backend/controllers/customerDashboardController.js
const OrderDetail = require('../models/OrderDetail');
const User = require('../models/User');

// @desc    Get total orders for a customer
// @route   GET /api/customer/dashboard/total-orders
// @access  Private (Customer)
const getTotalOrders = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const count = await OrderDetail.countDocuments({ user: userId });
    res.json({ totalOrders: count });
  } catch (error) {
    console.error("Error in getTotalOrders:", error);
    res.status(500).json({ message: "Server error while fetching total orders." });
  }
};

// @desc    Get wishlist items count for a customer
// @route   GET /api/customer/dashboard/wishlist-items-count
// @access  Private (Customer)
const getWishlistItemsCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('wishlist');
    res.json({ wishlistItemsCount: user && user.wishlist ? user.wishlist.length : 0 });
  } catch (error) {
    console.error("Error in getWishlistItemsCount:", error);
    res.status(500).json({ message: "Server error while fetching wishlist items count." });
  }
};

// @desc    Get total spent by a customer
// @route   GET /api/customer/dashboard/total-spent
// @access  Private (Customer)
const getTotalSpent = async (req, res) => {
  try {
    const userId = req.user.id;
    // Assuming 'Delivered' is a status that signifies a completed, paid order.
    // Adjust statuses if other conditions apply (e.g., 'Completed', 'ShippedAndPaid')
    const orders = await OrderDetail.find({ user: userId, status: 'Delivered' });
    const totalSpent = orders.reduce((acc, order) => acc + (order.summary && typeof order.summary.total === 'number' ? order.summary.total : 0), 0);
    res.json({ totalSpent: parseFloat(totalSpent.toFixed(2)) });
  } catch (error) {
    console.error("Error in getTotalSpent:", error);
    res.status(500).json({ message: "Server error while fetching total spent." });
  }
};

// @desc    Get recent orders for a customer
// @route   GET /api/customer/dashboard/recent-orders
// @access  Private (Customer)
const getRecentOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5; // Default to 5 recent orders
    const orders = await OrderDetail.find({ user: userId })
      .sort({ date: -1 }) // 'date' field as per OrderDetail model
      .limit(limit)
      .select('id items status summary.total date'); // Select relevant fields (id is the UUID)
    res.json({ recentOrders: orders });
  } catch (error) {
    console.error("Error in getRecentOrders:", error);
    res.status(500).json({ message: "Server error while fetching recent orders." });
  }
};

// @desc    Get active order for a customer
// @route   GET /api/customer/dashboard/active-order
// @access  Private (Customer)
const getActiveOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    // Define "active" statuses. This might include 'Processing', 'Shipped', etc.
    // 'Pending Payment' or 'Pending' might also be relevant depending on exact flow.
    const activeOrderStatuses = ['Processing', 'Shipped', 'Out for Delivery'];
    const activeOrder = await OrderDetail.findOne({
      user: userId,
      status: { $in: activeOrderStatuses },
    })
    .sort({ date: -1 }) // Get the most recent active order
    .select('id items status summary.total estimatedDelivery date');

    if (!activeOrder) {
      // It's not an error to have no active order, just return null or an empty object.
      return res.json({ activeOrder: null });
    }
    res.json({ activeOrder });
  } catch (error) {
    console.error("Error in getActiveOrder:", error);
    res.status(500).json({ message: "Server error while fetching active order." });
  }
};

module.exports = {
  getTotalOrders,
  getWishlistItemsCount,
  getTotalSpent,
  getRecentOrders,
  getActiveOrder,
};
