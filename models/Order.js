const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cryptoCurrency: {
      type: String,
      required: true,
    },
    termCode: {
      type: String,
      required: true,
    },
    openingPrice: {
      type: Number,
      required: true,
    },
    deliveryPrice: {
      type: Number,
      required: true,
    },
    direction: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
    orderTime: {
      type: Number,
      required: true,
    },
    buyAmount: {
      type: Number,
      required: true,
    },
    openingTime: {
      type: Date,
      required: true,
    },
    deliveryTime: {
      type: Date,
      required: true,
    },
    profit: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
