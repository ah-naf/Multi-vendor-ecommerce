const OrderDetail = require("../models/OrderDetail");
const User = require("../models/User");
const Product = require("../models/Product");
const { v4: uuidv4 } = require("uuid");

const placeOrder = async (req, res) => {
  const { items, shippingAddressId, shippingAddressDetails } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items in order" });
  }
  if (!shippingAddressId && !shippingAddressDetails) {
    return res.status(400).json({ message: "Shipping address is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let finalShippingAddress;

    if (shippingAddressId) {
      const savedAddr = user.addresses.id(shippingAddressId);
      if (!savedAddr) {
        return res.status(404).json({ message: "Saved address not found" });
      }

      finalShippingAddress = {
        name: `${user.firstName} ${user.lastName}`,
        addressLine1: savedAddr.addressLine1,
        addressLine2: savedAddr.addressLine2,
        city: savedAddr.city || "N/A",
        state: savedAddr.state || "N/A",
        zipCode: savedAddr.zip || "N/A",
        country: savedAddr.country || "N/A",
        phone: savedAddr.phone,
      };
    } else if (shippingAddressDetails) {
      if (
        !shippingAddressDetails.name ||
        !shippingAddressDetails.addressLine1 ||
        !shippingAddressDetails.city ||
        !shippingAddressDetails.state ||
        !shippingAddressDetails.zipCode ||
        !shippingAddressDetails.country ||
        !shippingAddressDetails.phone
      ) {
        return res.status(400).json({
          message:
            "Complete shipping address details are required for a new address.",
        });
      }
      finalShippingAddress = shippingAddressDetails;
    } else {
      return res
        .status(400)
        .json({ message: "Shipping address information is missing." });
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with ID ${item.productId} not found` });
      }
      if (!product.seller) {
        return res.status(500).json({
          message: `Product with ID ${item.productId} is missing seller information.`,
        });
      }
      orderItems.push({
        id: item.productId,
        name: product.general.title,
        attributes: product.general.category || "",
        price: product.pricing.price,
        quantity: item.quantity,
        image:
          product.general.images && product.general.images.length > 0
            ? product.general.images[0]
            : "",
        sellerId: product.seller,
      });
      subtotal += product.pricing.price * item.quantity;
    }

    const shippingCost = 69.99;
    const taxRate = 0.02;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + shippingCost + taxAmount;

    const newOrder = new OrderDetail({
      id: uuidv4(),
      date: new Date(),
      status: "Processing",
      shippingAddress: finalShippingAddress,
      payment: {
        method: "COD",
        last4: "N/A",
        billingAddress: `${finalShippingAddress.addressLine1}, ${finalShippingAddress.city}, ${finalShippingAddress.state} ${finalShippingAddress.zipCode}`,
        country: finalShippingAddress.country,
        phone: finalShippingAddress.phone,
      },
      items: orderItems,
      summary: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shippingCost.toFixed(2)),
        tax: parseFloat(taxAmount.toFixed(2)),
        total: parseFloat(totalAmount.toFixed(2)),
      },
      user: userId,
    });

    const savedOrder = await newOrder.save();

    if (user.cart && Array.isArray(user.cart)) {
      user.cart = [];
      await user.save({ validateBeforeSave: false });
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Server error while placing order" });
  }
};

const updateOrderStatusBySeller = async (req, res) => {
  const { orderId } = req.params;
  const {
    status,
    trackingNumber,
    carrier,
    estimatedShipDate,
    estimatedDelivery,
    cancellationReason,
  } = req.body;

  try {
    const order = await OrderDetail.findOne({ id: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) {
      if (!OrderDetail.schema.path("status").enumValues.includes(status)) {
        return res.status(400).json({ message: "Invalid order status" });
      }
      order.status = status;

      if (status === "Cancelled") {
        order.cancellationReason = cancellationReason || "Cancelled by seller"; //
        order.cancelledBy = "seller";
        order.cancelledDate = new Date();
      }
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    if (carrier) {
      order.carrier = carrier;
    }
    if (estimatedShipDate) {
      order.estimatedShipDate = estimatedShipDate;
    }
    if (estimatedDelivery) {
      order.estimatedDelivery = estimatedDelivery;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status by seller:", error);
    res
      .status(500)
      .json({ message: "Server error while updating order status" });
  }
};

const getOrdersByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await OrderDetail.find({ user: userId }).sort({ date: -1 });
    if (!orders) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    res.status(500).json({ message: "Server error while fetching orders." });
  }
};

const getOrderById = async (req, res) => {
  const { id: orderId } = req.params; // Ensure this 'id' is the UUID string field, not _id

  try {
    const order = await OrderDetail.findOne({ id: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Server error while fetching order." });
  }
};

const getOrdersBySeller = async (req, res) => {
  const sellerId = req.user.id;

  try {
    const sellerProducts = await Product.find({ seller: sellerId });
    if (!sellerProducts || sellerProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this seller." });
    }

    const sellerProductIds = sellerProducts.map((product) => product.id);

    const orders = await OrderDetail.find({
      "items.id": { $in: sellerProductIds },
    }).sort({ date: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: "No orders found containing items from this seller.",
      });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders by seller:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching seller orders." });
  }
};

const getSellerOrderById = async (req, res) => {
  const { id: orderId } = req.params;
  const sellerId = req.user.id;

  try {
    const order = await OrderDetail.findOne({ id: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const sellerProducts = await Product.find({ seller: sellerId });
    if (!sellerProducts || sellerProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "Seller has no products, order cannot be verified." });
    }
    const sellerProductIds = sellerProducts.map((product) => product.id);

    const isSellersOrder = order.items.some((item) =>
      sellerProductIds.includes(item.id)
    );

    if (!isSellersOrder) {
      return res.status(404).json({
        message:
          "Order not found or does not contain any items from this seller.",
      });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching seller order by ID:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching seller order." });
  }
};

const requestOrderCancellationByCustomer = async (req, res) => {
  const { orderId } = req.params;
  const { cancellationReason } = req.body;
  const userId = req.user.id;

  if (!cancellationReason) {
    return res.status(400).json({ message: "Cancellation reason is required" });
  }

  try {
    const order = await OrderDetail.findOne({ id: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this order." });
    }

    if (order.status !== "Processing") {
      return res.status(400).json({
        message: `Order cannot be cancelled as it is already ${order.status}.`,
      });
    }

    order.status = "Cancelled";
    order.cancellationReason = cancellationReason;
    order.cancelledBy = "customer";
    order.cancelledDate = new Date();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error requesting order cancellation by customer:", error);
    res
      .status(500)
      .json({ message: "Server error while requesting order cancellation." });
  }
};

module.exports = {
  placeOrder,
  updateOrderStatusBySeller,
  getOrdersByUser,
  getOrderById,
  getOrdersBySeller,
  getSellerOrderById,
  requestOrderCancellationByCustomer,
};
