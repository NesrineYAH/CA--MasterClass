//cart.js/controllers
const Cart = require("../Model/Cart");
const mongoose = require("mongoose");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      variantId,
      productId,
      nom,
      imageUrl,
      quantite = 1,
      options
    } = req.body;

    if (!variantId || !productId || !options || !options.size || !options.prix) {
      return res.status(400).json({ message: "Données produit incomplètes" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{
          variantId,
          productId,
          nom,
          imageUrl,
          quantite,
          options,
        }],
      });

      await cart.save();
      return res.json({ items: cart.items });
    }

    const existingItem = cart.items.find(
      i => i.variantId.toString() === variantId.toString()
    );

    if (existingItem) {
      existingItem.quantite += quantite;
    } else {
      cart.items.push({
        variantId,
        productId,
        nom,
        imageUrl,
        quantite,
        options,
      });
    }

    await cart.save();
    res.json({ items: cart.items });

  } catch (err) {
    console.error("❌ addToCart error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.json({ items: [] });

    return res.json({ items: cart.items });

  } catch (err) {
    console.error("❌ getCart error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { variantId, delta } = req.body;

    if (!variantId || delta === undefined) {
      return res.status(400).json({ message: "variantId et delta requis" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Panier vide" });
    }

    const item = cart.items.find(
      i => i.variantId.toString() === variantId.toString()
    );

    if (!item) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    item.quantite = Math.max(1, item.quantite + Number(delta));

    await cart.save();
    res.json({ items: cart.items });

  } catch (err) {
    console.error("❌ updateQuantity error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { variantId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Panier vide" });
    }

    const before = cart.items.length;

    cart.items = cart.items.filter(
      i => i.variantId.toString() !== variantId.toString()
    );

    if (cart.items.length === before) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    await cart.save();
    res.json({ items: cart.items });

  } catch (err) {
    console.error("❌ removeItem error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.json({ items: [] });

    cart.items = [];
    await cart.save();

    res.json({ items: [] });

  } catch (error) {
    console.error("Erreur clearCart :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.syncCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cartItems } = req.body;

    const map = new Map();

    cartItems.forEach(item => {
      const key = item.variantId.toString();

      if (map.has(key)) {
        map.get(key).quantite += item.quantite;
      } else {
        map.set(key, {
          ...item,
          variantId: key
        });
      }
    });

    const mergedItems = Array.from(map.values());

    await Cart.findOneAndUpdate(
      { userId },
      { items: mergedItems },
      { upsert: true, new: true }
    );

    res.json({ items: mergedItems });

  } catch (err) {
    console.error("❌ syncCart error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
};





