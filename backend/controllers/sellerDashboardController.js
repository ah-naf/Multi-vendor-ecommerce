// backend/controllers/sellerDashboardController.js
const Product = require('../models/Product');
const OrderDetail = require('../models/OrderDetail');
const User = require('../models/User'); // For seller info if needed

// Helper function to get date ranges
const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate = new Date(now);

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(new Date().setHours(23, 59, 59, 999));
      break;
    case 'week':
      const currentDay = now.getDay(); // 0 (Sunday) to 6 (Saturday)
      // Adjust to make Monday the first day of the week
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1)); // If Sunday, go back 6 days, else go back (currentDay - 1)
      firstDayOfWeek.setHours(0, 0, 0, 0);

      startDate = new Date(firstDayOfWeek);

      endDate = new Date(firstDayOfWeek);
      endDate.setDate(firstDayOfWeek.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month': // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'year': // Current year
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default: // Default to today
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
  }
  return { startDate, endDate };
};

// @desc    Get sales data for specified period
// @route   GET /api/seller/dashboard/sales-data?period=today|week|month|year
// @access  Private (Seller)
const getSalesData = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const period = req.query.period || 'today'; // default to 'today'
    const { startDate, endDate } = getDateRange(period);

    // Find orders that contain items sold by this seller and fall within the date range
    // OrderDetail.date is the field to check for date range
    const orders = await OrderDetail.find({
      'items.sellerId': sellerId, // Check if any item in the order belongs to the seller
      'status': { $in: ['Delivered', 'Shipped', 'Processing'] }, // Consider only sales-relevant statuses
      'date': { $gte: startDate, $lte: endDate }
    });

    let totalSales = 0;
    let totalOrdersCount = 0; // Count of orders that include at least one item from the seller

    orders.forEach(order => {
      let salesFromThisOrder = 0;
      let sellerItemsInOrder = false;
      order.items.forEach(item => {
        // Important: Ensure sellerId in items is an ObjectId or string that matches req.user.id type
        if (item.sellerId && item.sellerId.toString() === sellerId.toString()) {
          salesFromThisOrder += item.price * item.quantity;
          sellerItemsInOrder = true;
        }
      });
      if (sellerItemsInOrder) {
          totalSales += salesFromThisOrder;
          totalOrdersCount++; // Increment if this order had items from the seller
      }
    });

    res.json({ period, totalSales: parseFloat(totalSales.toFixed(2)), totalOrdersCount });
  } catch (error) {
    console.error(`Error in getSalesData (${req.query.period}):`, error);
    res.status(500).json({ message: 'Server error while fetching sales data.' });
  }
};

// @desc    Get sales performance (e.g., current month vs last month)
// @route   GET /api/seller/dashboard/sales-performance
// @access  Private (Seller)
const getSalesPerformance = async (req, res) => {
  try {
    // For simplicity, this will be a placeholder.
    // A real implementation would fetch current and previous period sales and compare.
    res.json({
      currentMonthSales: 0, // Placeholder
      previousMonthSales: 0, // Placeholder
      performanceTrend: 'N/A', // Placeholder: (e.g., "up", "down", "flat")
      percentageChange: 0 // Placeholder
    });
  } catch (error) {
    console.error("Error in getSalesPerformance:", error);
    res.status(500).json({ message: 'Server error while fetching sales performance.' });
  }
};

// @desc    Get order status counts for items sold by the seller
// @route   GET /api/seller/dashboard/order-status-counts
// @access  Private (Seller)
const getOrderStatusCounts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    // Find orders containing items from this seller
    const orders = await OrderDetail.find({ 'items.sellerId': sellerId });

    const statusCounts = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      // Add other statuses as defined in OrderDetail schema
    };

    // This counts orders. If an order has multiple items from the same seller, it's counted once.
    // If an order has items from different sellers, it's counted for this seller if at least one item is theirs.
    orders.forEach(order => {
      // Check if this order truly has an item from the seller before counting its status
      const hasSellerItem = order.items.some(item => item.sellerId && item.sellerId.toString() === sellerId.toString());
      if (hasSellerItem) {
        if (statusCounts.hasOwnProperty(order.status)) {
          statusCounts[order.status]++;
        } else {
          // If a new status appears that's not in the initial object
          // statusCounts[order.status] = 1;
        }
      }
    });

    res.json(statusCounts);
  } catch (error) {
    console.error("Error in getOrderStatusCounts:", error);
    res.status(500).json({ message: 'Server error while fetching order status counts.' });
  }
};

// @desc    Get revenue trend data (e.g., monthly over last year)
// @route   GET /api/seller/dashboard/revenue-trend
// @access  Private (Seller)
const getRevenueTrendData = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1); // Start from the first day of that month
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const now = new Date();
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    const orders = await OrderDetail.find({
      'items.sellerId': sellerId,
      'status': { $in: ['Delivered', 'Shipped'] }, // Consider only completed or near-completed sales for revenue
      'date': { $gte: twelveMonthsAgo, $lte: endOfCurrentMonth }
    }).sort({ date: 1 }); // Sort by date to make processing easier if needed, though aggregation handles grouping

    const monthlyRevenue = {}; // Store revenue like { 'YYYY-MM': revenue }

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.sellerId && item.sellerId.toString() === sellerId.toString()) {
          const orderMonth = order.date.getFullYear() + '-' + (order.date.getMonth() + 1).toString().padStart(2, '0');
          const itemRevenue = item.price * item.quantity;
          monthlyRevenue[orderMonth] = (monthlyRevenue[orderMonth] || 0) + itemRevenue;
        }
      });
    });

    // Initialize trendData for the last 12 months with 0 revenue
    const trendData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 12; i++) {
      const dateCursor = new Date(now);
      dateCursor.setMonth(now.getMonth() - (11 - i)); // Iterate from 11 months ago to current month
      const monthKey = dateCursor.getFullYear() + '-' + (dateCursor.getMonth() + 1).toString().padStart(2, '0');
      const monthName = monthNames[dateCursor.getMonth()];

      trendData.push({
        name: monthName, // Format: "Jan", "Feb", etc.
        revenue: parseFloat((monthlyRevenue[monthKey] || 0).toFixed(2))
      });
    }

    res.json(trendData);
  } catch (error) {
    console.error("Error in getRevenueTrendData:", error);
    res.status(500).json({ message: 'Server error while fetching revenue trend data.' });
  }
};

// @desc    Get low stock product count for the seller
// @route   GET /api/seller/dashboard/low-stock-count
// @access  Private (Seller)
const getLowStockProductCount = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const stockThreshold = parseInt(req.query.threshold) || 5; // Default threshold 5 or from query

    const lowStockCount = await Product.countDocuments({
      seller: sellerId,
      'inventory.quantity': { $lt: stockThreshold, $gt: 0 } // Optionally, only count if > 0
    });
    // To count products with quantity 0 as well: 'inventory.quantity': { $lte: stockThreshold }

    res.json({ lowStockProductCount: lowStockCount, threshold: stockThreshold });
  } catch (error) {
    console.error("Error in getLowStockProductCount:", error);
    res.status(500).json({ message: 'Server error while fetching low stock product count.' });
  }
};

module.exports = {
  getSalesData,
  getSalesPerformance,
  getOrderStatusCounts,
  getRevenueTrendData,
  getLowStockProductCount,
};
