// models/OrderDetail.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShippingAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  { _id: false }
);

const PaymentSchema = new Schema(
  {
    method: { type: String, required: true },
    last4: { type: String, required: true },
    billingAddress: { type: String, required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    attributes: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: "" },
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
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    id: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Delivered", "Shipped", "Processing", "Cancelled"],
    },
    deliveredDate: { type: Date },
    cancelledDate: { type: Date },
    refundStatus: { type: String },

    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDelivery: { type: Date },
    estimatedShipDate: { type: Date },

    shippingAddress: { type: ShippingAddressSchema, required: true },
    payment: { type: PaymentSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    summary: { type: SummarySchema, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrderDetail", OrderDetailSchema);
