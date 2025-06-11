// models/SellerOrder.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const BuyerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    paymentMethod: {
      type: { type: String, required: true },
      last4: { type: String, required: true },
      paid: { type: Boolean, required: true },
    },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const TimelineEventSchema = new Schema(
  {
    label: { type: String, required: true },
    date: { type: String, required: true },
    completed: { type: Boolean, required: true },
  },
  { _id: false }
);

const PaymentInfoSchema = new Schema(
  {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const SellerOrderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    date: { type: Date, required: true },

    buyer: { type: BuyerSchema, required: true },
    product: { type: ProductSchema, required: true },
    quantity: { type: Number, required: true },
    condition: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
    },

    timeline: { type: [TimelineEventSchema], required: true },
    paymentInfo: { type: PaymentInfoSchema, required: true },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SellerOrder", SellerOrderSchema);
