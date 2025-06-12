const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      addresses: user.addresses,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      addresses: updatedUser.addresses,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Add shipping address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    const { street, city, state, zip, country, isDefault } = req.body;

    const newAddress = {
      street,
      city,
      state,
      zip,
      country,
      isDefault,
    };

    user.addresses.push(newAddress);

    // If the new address is set as default, update other addresses
    if (isDefault) {
      user.addresses.forEach(address => {
        if (address !== newAddress) {
          address.isDefault = false;
        }
      });
    }

    await user.save();
    res.status(201).json(user.addresses);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update shipping address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    const address = user.addresses.id(req.params.id);

    if (address) {
      address.street = req.body.street || address.street;
      address.city = req.body.city || address.city;
      address.state = req.body.state || address.state;
      address.zip = req.body.zip || address.zip;
      address.country = req.body.country || address.country;
      address.isDefault = req.body.isDefault === undefined ? address.isDefault : req.body.isDefault;

      // If this address is being set as default, update other addresses
      if (address.isDefault) {
        user.addresses.forEach(addr => {
          if (addr.id !== req.params.id) {
            addr.isDefault = false;
          }
        });
      }

      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404);
      throw new Error('Address not found');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    const address = user.addresses.id(req.params.id);

    if (address) {
      address.remove();
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404);
      throw new Error('Address not found');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};


module.exports = {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
};
