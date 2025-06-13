const OrderDetail = require('../models/OrderDetail');
const User = require('../models/User');
const Product = require('../models/Product'); // Assuming Product model exists and is relevant for price/details
const { v4: uuidv4 } = require('uuid'); // For generating unique order IDs

const placeOrder = async (req, res) => {
  const { items, shippingAddressId, shippingAddressDetails } = req.body; // items: [{ productId, quantity }], shippingAddressId: ID of saved address, shippingAddressDetails: object for new address
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }
  if (!shippingAddressId && !shippingAddressDetails) {
     return res.status(400).json({ message: 'Shipping address is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let finalShippingAddress;

    if (shippingAddressId) {
      const savedAddr = user.addresses.id(shippingAddressId);
      if (!savedAddr) {
        return res.status(404).json({ message: 'Saved address not found' });
      }
      // Construct finalShippingAddress from savedAddr.
      // This is a simplified version; User.AddressSchema might not have all fields for OrderDetail.ShippingAddressSchema
      finalShippingAddress = {
        name: `${user.firstName} ${user.lastName}`, // Assuming user has firstName and lastName
        address: savedAddr.address,
        city: savedAddr.city || 'N/A', // Assuming city, state, zip might be missing from User.AddressSchema
        state: savedAddr.state || 'N/A',
        zip: savedAddr.zip || 'N/A',
        // country: savedAddr.country || 'N/A' // If country is in User.AddressSchema
      };
    } else if (shippingAddressDetails) {
      // Assume shippingAddressDetails comes with name, address, city, state, zip
      if (!shippingAddressDetails.name || !shippingAddressDetails.address || !shippingAddressDetails.city || !shippingAddressDetails.state || !shippingAddressDetails.zip) {
         return res.status(400).json({ message: 'Complete shipping address details are required for a new address.' });
      }
      finalShippingAddress = shippingAddressDetails;
    } else {
      // This case should ideally be caught by the initial check, but as a fallback:
      return res.status(400).json({ message: 'Shipping address information is missing.' });
    }


    let orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      orderItems.push({
        // id: product._id.toString(), // OrderItemSchema has 'id' as number, but product._id is string. Let's use product._id as string for now, or adjust schema.
        // For now, let's assume OrderItemSchema's 'id' is meant to be productId.
        id: item.productId, // Using the productId from the cart item
        name: product.name,
        attributes: item.attributes || '', // Assuming attributes might come from cart item
        price: product.price, // Use price from DB
        quantity: item.quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
      });
      subtotal += product.price * item.quantity;
    }

    // Define shipping and tax (can be made more dynamic later)
    const shippingCost = 69.99; // Example fixed shipping
    const taxRate = 0.02; // Example tax rate (2%)
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + shippingCost + taxAmount;

    const newOrder = new OrderDetail({
      id: uuidv4(), // Generate unique order ID
      date: new Date(),
      status: 'Processing',
      // shippingAddress will be populated based on logic above
      shippingAddress: finalShippingAddress,
      payment: {
        method: 'COD',
        last4: 'N/A', // Not applicable for COD
        billingAddress: finalShippingAddress.address, // Or make it more specific if needed
      },
      items: orderItems,
      summary: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shippingCost.toFixed(2)),
        tax: parseFloat(taxAmount.toFixed(2)),
        total: parseFloat(totalAmount.toFixed(2)),
      },
      // user: userId, // Consider adding a user field to OrderDetail schema to link orders to users
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
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error while placing order' });
  }
};

module.exports = { placeOrder };
