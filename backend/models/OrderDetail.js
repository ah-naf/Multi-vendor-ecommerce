// models/OrderDetail.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShippingAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: false },
  },
  { _id: false }
);

const PaymentSchema = new Schema(
  {
    method: { type: String, required: true },
    last4: { type: String, required: true },
    billingAddress: { type: String, required:true },
    country: { type: String, required: true },
    phone: { type: String, required: false },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    attributes: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: "" },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { _id: false }
);

const SummarySchema = new Schema(
  {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const OrderDetailSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "Processing",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
    },
    deliveredDate: { type: Date },
    cancelledDate: { type: Date },
    cancellationReason: { type: String, default: null }, // Added cancellationReason
    cancelledBy: { type: String, enum: ['seller', 'customer', 'admin', 'system', null], default: null }, // Added cancelledBy
    refundStatus: { type: String },

    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDelivery: { type: Date },
    estimatedShipDate: { type: Date },

    shippingAddress: { type: ShippingAddressSchema, required: true },
    payment: { type: PaymentSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    summary: { type: SummarySchema, required: true },
    user: {
      // It's good practice to link the order to a user
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrderDetail", OrderDetailSchema);
