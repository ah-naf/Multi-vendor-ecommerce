// models/Transaction.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'OrderDetail' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Paid", "Pending", "Failed"],
    },
    paymentGatewayTransactionId: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
