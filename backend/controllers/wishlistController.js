const User = require('../models/User');
const Product = require('../models/Product');

// @desc Add item to wishlist
// @route POST /api/wishlist/add
// @access Private
const addToWishlist = async (req, res) => {
  const { productId, name, price, image, attributes } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingItem = user.wishlist.find(
      (item) => item.productId === productId && item.attributes === attributes
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    const newItem = {
      productId,
      name,
      price,
      image,
      attributes,
    };
    user.wishlist.push(newItem);

    await user.save();
    res.status(200).json(user.wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Remove item from wishlist
// @route DELETE /api/wishlist/remove/:productId
// @access Private
const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wishlist = user.wishlist.filter(
      (item) => item.productId !== productId
    );

    await user.save();
    res.status(200).json(user.wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all wishlist items
// @route GET /api/wishlist
// @access Private
const getWishlistItems = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.wishlist);
  } catch (error) {
    console.error('Error getting wishlist items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlistItems,
};
