// models/Transaction.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    product: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Paid", "Pending", "Failed"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
