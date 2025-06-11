// models/Product.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub‐schema for each custom spec
const CustomSpecSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    general: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      images: { type: [String], required: true },
      category: { type: String, required: true },
    },
    specifications: {
      customSpecs: { type: [CustomSpecSchema], default: [] },
    },
    pricing: {
      price: { type: Number, required: true },
      salePrice: { type: Number, default: null },
      enableNegotiation: { type: Boolean, default: false },
    },
    inventory: {
      quantity: { type: Number, required: true },
      sku: { type: String, required: true },
    },
    additional: {
      tags: { type: String, default: "" },
    },
    seo: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Product", ProductSchema);
