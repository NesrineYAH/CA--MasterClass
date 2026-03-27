// Model Cart - Schéma  Cart panier 
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      variantId: {
        type: String,
        required: true
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      nom: { type: String, required: true },
      imageUrl: String,
      quantite: { type: Number, default: 1 },
      options: {
        size: { type: Number, required: true },
        unit: { type: String, default: "ml" },
        prix: { type: Number, required: true },
      },
    },
  ],
});


module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);









/*
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      nom: String,
      prix: Number,
      imageUrl: String,
      quantity: { type: Number, default: 1 },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
*/