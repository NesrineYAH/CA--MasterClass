// Backend/Model/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stripeCustomerId: {
      type: String,
      required: true,
    },

    stripePaymentIntentId: {
      type: String,

      required: true,
      unique: true, 
    },

    stripeCheckoutSessionId: {
      type: String,
    },

    amount: {
      type: Number, 
      required: true,
    },

    currency: {
      type: String,
      default: "eur",
    },

    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      required: true,
    },

    paymentMethod: {
      brand: String,
      last4: String,
    },

    metadata: {
      type: Object, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
