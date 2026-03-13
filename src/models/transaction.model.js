const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must be has a From Account"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must be has a To Account"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Failed", "Completed", "Reversed"],
      },
      default: "Pending",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required for transaction"],
      min: [0, "Transaction must be positive number"],
    },
    // repeating the same transaction stop , on client side Generated
    idempotencyKey: {
      type: String,
      unique: true,
      index: true,
      required: [true, "Key is required to create a Transaction"],
    },
  },
  {
    timestamps: true,
  },
);
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
