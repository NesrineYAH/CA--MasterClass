// backend/routes/paymentMethods.js
const express = require("express");
const Payment = require("../Model/Payment");
const User = require("../Model/User");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");

router.get("/payment-methods", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    const cards = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      exp_month: pm.card.exp_month,
      exp_year: pm.card.exp_year,
    }));

    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération cartes" });
  }
});


module.exports = router;



