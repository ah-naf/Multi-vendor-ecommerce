const OrderDetail = require("../models/OrderDetail");
const User = require("../models/User");
const Product = require("../models/Product"); // Assuming Product model exists and is relevant for price/details
const { v4: uuidv4 } = require("uuid"); // For generating unique order IDs

const placeOrder = async (req, res) => {
  const { items, shippingAddressId, shippingAddressDetails } = req.body; // items: [{ productId, quantity }], shippingAddressId: ID of saved address, shippingAddressDetails: object for new address
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
      // Construct finalShippingAddress from savedAddr.
      // This is a simplified version; User.AddressSchema might not have all fields for OrderDetail.ShippingAddressSchema
      finalShippingAddress = {
        name: `${user.firstName} ${user.lastName}`, // Assuming user has firstName and lastName
        addressLine1: savedAddr.addressLine1,
        addressLine2: savedAddr.addressLine2,
        city: savedAddr.city || "N/A", // Assuming city, state, zip might be missing from User.AddressSchema
        state: savedAddr.state || "N/A",
        zipCode: savedAddr.zip || "N/A",
        country: savedAddr.country || "N/A", // Map country if it exists
        phone: savedAddr.phone, // Map phone if it exists, otherwise undefined
      };
    } else if (shippingAddressDetails) {
      // Assume shippingAddressDetails comes with name, address, city, state, zip
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
      // This case should ideally be caught by the initial check, but as a fallback:
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
      // Ensure product.seller is available and is the seller's ObjectId
      if (!product.seller) {
        return res.status(500).json({
          message: `Product with ID ${item.productId} is missing seller information.`,
        });
      }
      orderItems.push({
        id: item.productId,
        name: product.general.title,
        attributes: product.general.category || "", // Assuming cart item might have attributes
        price: product.pricing.price,
        quantity: item.quantity,
        image:
          product.general.images && product.general.images.length > 0
            ? product.general.images[0]
            : "",
        sellerId: product.seller, // <-- New field added
      });
      subtotal += product.pricing.price * item.quantity;
    }

    // Define shipping and tax (can be made more dynamic later)
    const shippingCost = 69.99; // Example fixed shipping
    const taxRate = 0.02; // Example tax rate (2%)
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
        // Create a full string for the billing address
        billingAddress: `${finalShippingAddress.addressLine1}, ${finalShippingAddress.city}, ${finalShippingAddress.state} ${finalShippingAddress.zipCode}`,
        // Add the required country field
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

    // Clear user's cart
    // Assuming user.cart is an array of objects like [{ productId, quantity, ... }]
    // If user.cart is just an array of productIds, adjust accordingly.
    // For this implementation, we assume the user model has a 'cart' field that is an array.
    if (user.cart && Array.isArray(user.cart)) {
      user.cart = [];
      await user.save({ validateBeforeSave: false }); // Added validateBeforeSave: false to avoid potential validation issues if other cart fields are required
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
    cancellationReason, // Added for cancellation
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

      // If status is 'Cancelled', set cancellation details
      if (status === "Cancelled") {
        if (!cancellationReason) {
          // Optional: Add validation for cancellationReason if required for seller cancellations
          // return res.status(400).json({ message: "Cancellation reason is required when cancelling an order." });
        }
        order.cancellationReason = cancellationReason || "Cancelled by seller"; // Default reason if not provided
        order.cancelledBy = 'seller';
        order.cancelledDate = new Date();
      } else {
        // Potentially clear cancellation fields if status changes from 'Cancelled' to something else
        // This depends on business logic: should a previously cancelled order that's then, say, 'Reprocessed' clear these?
        // For now, we only set them on cancellation. If it needs to be cleared, add:
        // order.cancellationReason = null;
        // order.cancelledBy = null;
        // order.cancelledDate = null;
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

// Get all orders for the logged-in user
const getOrdersByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await OrderDetail.find({ user: userId }).sort({ date: -1 });
    if (!orders) {
      // This case might not be strictly necessary if find returns [] for no matches
      // but good for explicit clarity if an actual DB error occurred resulting in null
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

// Get a specific order by its ID for the logged-in user (or any user if no user check)
const getOrderById = async (req, res) => {
  const { id: orderId } = req.params; // Ensure this 'id' is the UUID string field, not _id
  // const userId = req.user.id; // Optional: Uncomment if orders should only be fetched by the user who placed them

  try {
    const order = await OrderDetail.findOne({ id: orderId });
    // Optional: Add user check: await OrderDetail.findOne({ id: orderId, user: userId });
    // If adding user check, adjust error message for "not found or not authorized"

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Server error while fetching order." });
  }
};

// Get orders relevant to a seller
const getOrdersBySeller = async (req, res) => {
  const sellerId = req.user.id;

  try {
    // Find all products belonging to the seller
    const sellerProducts = await Product.find({ seller: sellerId }); // Assuming Product model has a 'user' field for seller ID
    if (!sellerProducts || sellerProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this seller." });
    }

    const sellerProductIds = sellerProducts.map((product) => product.id); // Assuming product.id is the UUID

    // Find orders that contain at least one item from the seller's products
    const orders = await OrderDetail.find({
      "items.id": { $in: sellerProductIds }, // Check if any item.id in the items array is in sellerProductIds
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

// Get a specific order by ID for a seller, ensuring the order contains one of their products
const getSellerOrderById = async (req, res) => {
  const { id: orderId } = req.params;
  const sellerId = req.user.id;

  try {
    const order = await OrderDetail.findOne({ id: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Verify that at least one item in the order belongs to the seller
    const sellerProducts = await Product.find({ seller: sellerId });
    if (!sellerProducts || sellerProducts.length === 0) {
      // This case means the seller has no products, so no order can belong to them.
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

module.exports = {
  placeOrder,
  updateOrderStatusBySeller,
  getOrdersByUser,
  getOrderById,
  getOrdersBySeller,
  getSellerOrderById,
  requestOrderCancellationByCustomer, // Added new function
};

// Request order cancellation by customer
const requestOrderCancellationByCustomer = async (req, res) => {
  const { orderId } = req.params;
  const { cancellationReason } = req.body;
  const userId = req.user.id; // Assuming authMiddleware provides req.user

  if (!cancellationReason) {
    return res
      .status(400)
      .json({ message: "Cancellation reason is required" });
  }

  try {
    const order = await OrderDetail.findOne({ id: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the logged-in user is the one who placed the order
    if (order.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this order." });
    }

    // Check if the order is eligible for cancellation
    if (order.status !== "Processing") {
      return res.status(400).json({
        message: `Order cannot be cancelled as it is already ${order.status}.`,
      });
    }

    // Update order details for cancellation
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
