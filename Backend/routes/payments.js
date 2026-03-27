// backend/routes/payment.js
const express = require("express");
const Payment = require("../Model/Payment");
const router = express.Router();

router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.userId }).populate("user")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    console.error("❌ Payments fetch error :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;

