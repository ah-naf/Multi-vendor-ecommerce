const User = require('../models/User');
const Product = require('../models/Product');

// @desc Add item to cart
// @route POST /api/cart/add
// @access Private
const addToCart = async (req, res) => {
  const { productId, quantity, name, price, image, attributes } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingItemIndex = user.cart.findIndex(
      (item) => item.productId === productId && item.attributes === attributes
    );

    if (existingItemIndex > -1) {
      // Item already exists, update quantity
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      const newItem = {
        productId,
        name,
        price,
        quantity,
        image,
        attributes,
      };
      user.cart.push(newItem);
    }

    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Clear all items from user's cart
// @route DELETE /api/cart/clear
// @access Private
const clearUserCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.cart = [];
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ message: 'Cart cleared successfully', cart: user.cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error while clearing cart' });
  }
};

// @desc Remove item from cart
// @route DELETE /api/cart/remove/:productId
// @access Private
const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter((item) => item.productId !== productId);

    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update cart item quantity
// @route PUT /api/cart/update/:productId
// @access Private
const updateCartItemQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.cart.findIndex((item) => item.productId === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is zero or less
        user.cart.splice(itemIndex, 1);
      } else {
        // Update quantity
        user.cart[itemIndex].quantity = quantity;
      }
      await user.save();
      res.status(200).json(user.cart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all cart items
// @route GET /api/cart
// @access Private
const getCartItems = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    console.error('Error getting cart items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  getCartItems,
  clearUserCart, // Added
};
