const Product = require("../models/Product");
const OrderDetail = require("../models/OrderDetail");
const User = require("../models/User");

const getDateRange = (period) => {
  const now = new Date();
  let startDate,
    endDate = new Date(now);

  switch (period) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(new Date().setHours(23, 59, 59, 999));
      break;
    case "week":
      const currentDay = now.getDay();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(
        now.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
      );
      firstDayOfWeek.setHours(0, 0, 0, 0);

      startDate = new Date(firstDayOfWeek);

      endDate = new Date(firstDayOfWeek);
      endDate.setDate(firstDayOfWeek.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
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
    const period = req.query.period || "today";
    const { startDate, endDate } = getDateRange(period);

    const orders = await OrderDetail.find({
      "items.sellerId": sellerId,
      status: { $in: ["Delivered", "Shipped", "Processing"] },
      date: { $gte: startDate, $lte: endDate },
    });

    let totalSales = 0;
    let totalOrdersCount = 0;

    orders.forEach((order) => {
      let salesFromThisOrder = 0;
      let sellerItemsInOrder = false;
      order.items.forEach((item) => {
        if (item.sellerId && item.sellerId.toString() === sellerId.toString()) {
          salesFromThisOrder += item.price * item.quantity;
          sellerItemsInOrder = true;
        }
      });
      if (sellerItemsInOrder) {
        totalSales += salesFromThisOrder;
        totalOrdersCount++;
      }
    });

    res.json({
      period,
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalOrdersCount,
    });
  } catch (error) {
    console.error(`Error in getSalesData (${req.query.period}):`, error);
    res
      .status(500)
      .json({ message: "Server error while fetching sales data." });
  }
};

// @desc    Get sales performance (e.g., current month vs last month)
// @route   GET /api/seller/dashboard/sales-performance
// @access  Private (Seller)
const getSalesPerformance = async (req, res) => {
  try {
    res.json({
      currentMonthSales: 0,
      previousMonthSales: 0,
      performanceTrend: "N/A",
      percentageChange: 0,
    });
  } catch (error) {
    console.error("Error in getSalesPerformance:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching sales performance." });
  }
};

// @desc    Get order status counts for items sold by the seller
// @route   GET /api/seller/dashboard/order-status-counts
// @access  Private (Seller)
const getOrderStatusCounts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orders = await OrderDetail.find({ "items.sellerId": sellerId });

    const statusCounts = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      const hasSellerItem = order.items.some(
        (item) =>
          item.sellerId && item.sellerId.toString() === sellerId.toString()
      );
      if (hasSellerItem) {
        if (statusCounts.hasOwnProperty(order.status)) {
          statusCounts[order.status]++;
        }
      }
    });

    res.json(statusCounts);
  } catch (error) {
    console.error("Error in getOrderStatusCounts:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching order status counts." });
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
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const now = new Date();
    const endOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    const orders = await OrderDetail.find({
      "items.sellerId": sellerId,
      status: { $in: ["Delivered", "Shipped"] },
      date: { $gte: twelveMonthsAgo, $lte: endOfCurrentMonth },
    }).sort({ date: 1 });

    const monthlyRevenue = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.sellerId && item.sellerId.toString() === sellerId.toString()) {
          const orderMonth =
            order.date.getFullYear() +
            "-" +
            (order.date.getMonth() + 1).toString().padStart(2, "0");
          const itemRevenue = item.price * item.quantity;
          monthlyRevenue[orderMonth] =
            (monthlyRevenue[orderMonth] || 0) + itemRevenue;
        }
      });
    });

    const trendData = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 0; i < 12; i++) {
      const dateCursor = new Date(now);
      dateCursor.setMonth(now.getMonth() - (11 - i));
      const monthKey =
        dateCursor.getFullYear() +
        "-" +
        (dateCursor.getMonth() + 1).toString().padStart(2, "0");
      const monthName = monthNames[dateCursor.getMonth()];

      trendData.push({
        name: monthName,
        revenue: parseFloat((monthlyRevenue[monthKey] || 0).toFixed(2)),
      });
    }

    res.json(trendData);
  } catch (error) {
    console.error("Error in getRevenueTrendData:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching revenue trend data." });
  }
};

// @desc    Get low stock product count for the seller
// @route   GET /api/seller/dashboard/low-stock-count
// @access  Private (Seller)
const getLowStockProductCount = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const stockThreshold = parseInt(req.query.threshold) || 5;

    const lowStockCount = await Product.countDocuments({
      seller: sellerId,
      "inventory.quantity": { $lt: stockThreshold, $gt: 0 },
    });

    res.json({
      lowStockProductCount: lowStockCount,
      threshold: stockThreshold,
    });
  } catch (error) {
    console.error("Error in getLowStockProductCount:", error);
    res.status(500).json({
      message: "Server error while fetching low stock product count.",
    });
  }
};

module.exports = {
  getSalesData,
  getSalesPerformance,
  getOrderStatusCounts,
  getRevenueTrendData,
  getLowStockProductCount,
};
