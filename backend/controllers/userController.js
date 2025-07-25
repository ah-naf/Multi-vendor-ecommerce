const User = require("../models/User.js");

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, bio } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    res.status(res.statusCode || 500);
    res.json({
      message: error.message,
    });
  }
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.addresses);
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    res.status(500).json({ message: "Server error while fetching addresses" });
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      isDefault,
    } = req.body;

    if (!type || !addressLine1 || !city || !state || !zipCode || !country) {
      res.status(400);
      throw new Error(
        "Type, address line 1, city, state, zip code, and country are required"
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      type,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json(user.addresses[user.addresses.length - 1]);
  } catch (error) {
    res
      .status(res.statusCode >= 400 ? res.statusCode : 500)
      .json({ message: error.message });
  }
};

// @desc Update an existing address
// @route PUT /api/users/addresses/:addressId
// @access Private
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const {
      type,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      isDefault,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const addressToUpdate = user.addresses.id(addressId);
    if (!addressToUpdate) {
      res.status(404);
      throw new Error("Address not found");
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        if (!addr._id.equals(addressToUpdate._id)) {
          addr.isDefault = false;
        }
      });
    }

    addressToUpdate.type = type || addressToUpdate.type;
    addressToUpdate.addressLine1 = addressLine1 || addressToUpdate.addressLine1;
    addressToUpdate.addressLine2 =
      addressLine2 !== undefined ? addressLine2 : addressToUpdate.addressLine2;
    addressToUpdate.city = city || addressToUpdate.city;
    addressToUpdate.state = state || addressToUpdate.state;
    addressToUpdate.zipCode = zipCode || addressToUpdate.zipCode;
    addressToUpdate.country = country || addressToUpdate.country;

    if (typeof isDefault === "boolean") {
      addressToUpdate.isDefault = isDefault;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res
      .status(res.statusCode >= 400 ? res.statusCode : 500)
      .json({ message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const addressIndex = user.addresses.findIndex((addr) =>
      addr._id.equals(addressId)
    );

    if (addressIndex === -1) {
      res.status(404);
      throw new Error("Address not found");
    }

    const deletedAddress = user.addresses[addressIndex];
    user.addresses.splice(addressIndex, 1);

    if (deletedAddress.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ message: "Address removed", addresses: user.addresses });
  } catch (error) {
    console.log(error);
    res
      .status(res.statusCode >= 400 ? res.statusCode : 500)
      .json({ message: error.message });
  }
};

// @desc    Set an address as default
// @route   PUT /api/users/addresses/:addressId/default
// @access  Private
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    let foundAddress = false;
    user.addresses.forEach((addr) => {
      if (addr._id.equals(addressId)) {
        addr.isDefault = true;
        foundAddress = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!foundAddress) {
      res.status(404);
      throw new Error("Address not found to set as default");
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res
      .status(res.statusCode >= 400 ? res.statusCode : 500)
      .json({ message: error.message });
  }
};

module.exports = {
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserAddresses,
};
