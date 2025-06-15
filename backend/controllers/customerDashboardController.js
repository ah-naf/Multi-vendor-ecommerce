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
    const limit = parseInt(req.query.limit) || 5; 
    const orders = await OrderDetail.find({ user: userId })
      .sort({ date: -1 }) 
      .limit(limit)
      .select('id items status summary.total date'); 
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
    const activeOrderStatuses = ['Processing', 'Shipped', 'Out for Delivery'];
    const activeOrder = await OrderDetail.findOne({
      user: userId,
      status: { $in: activeOrderStatuses },
    })
    .sort({ date: -1 }) 
    .select('id items status summary.total estimatedDelivery date');

    if (!activeOrder) {
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
