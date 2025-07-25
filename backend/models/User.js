const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const AddressSchema = new Schema(
  {
    type: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const CartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    attributes: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const WishlistItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    attributes: { type: String, default: "" },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    roles: { type: [String], default: ["customer"] },
    addresses: { type: [AddressSchema], default: [] },
    cart: { type: [CartItemSchema], default: [] },
    wishlist: { type: [WishlistItemSchema], default: [] },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
