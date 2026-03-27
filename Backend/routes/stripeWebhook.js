// Backend/routes/stripeWebhook.js
const express = require("express");
const Stripe = require("stripe");
const Order = require("../Model/Order");
const Payment = require("../Model/Payment");
const { sendEmail } = require("../utils/mailer");

require("dotenv").config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Signature webhook invalide :", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    console.log("🧾 orderId envoyé à Stripe :", orderId);

    if (!orderId) {
      console.error("❌ orderId manquant dans metadata");
      return res.status(400).json({ error: "orderId manquant" });
    }

    // 1️⃣ Paiement réussi
    if (event.type === "checkout.session.completed") {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        const stripeCustomer = await stripe.customers.retrieve(session.customer);
        const charge = paymentIntent.charges.data[0];
        const email = session.customer_details?.email || stripeCustomer.email ||
          paymentIntent.receipt_email || session.metadata?.email;
        const amount = paymentIntent.amount / 100;

        // 📧 Envoi de l’email de confirmation
        await sendEmail({
          to: email,
          subject: "Votre paiement est confirmé",
          html: `
            <h2>Merci pour votre commande !</h2>
            <p>Votre paiement de <strong>${amount} €</strong> a été confirmé.</p>
            <p>Nous préparons votre commande.</p>
          `,
        });
        console.log("📩 Email dans paymentIntent :", paymentIntent.receipt_email);
        console.log("📩 Email dans session :", session.customer_details?.email);
        console.log("📧 Email envoyé à :", email);

        // Mise à jour du paiement

        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            user: userId,
            email,
            stripeCustomerId: session.customer,
            stripePaymentIntentId: paymentIntent.id,
            stripeCheckoutSessionId: session.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            paymentMethod: {
              brand: charge.payment_method_details.card.brand,
              last4: charge.payment_method_details.card.last4,
            },
            metadata: session.metadata,
          },
          { upsert: true, new: true }
        );
        console.log("📨 Email à envoyer :", email);

        // Mise à jour de la commande
        await Order.findByIdAndUpdate(
          orderId,
          {
            status: "confirmed",
            paymentStatus: "paid",
            paidAt: new Date(),
          },
          { new: true }
        );

        console.log("🟩 Commande mise à jour comme PAYÉE :", orderId);
      } catch (err) {
        console.error("❌ Erreur mise à jour commande payée :", err.message);
      }
    }

    // 2️⃣ Paiement expiré
    if (event.type === "checkout.session.expired") {
      try {
        console.log("⚠️ Paiement expiré pour la commande :", orderId);

        await Order.findByIdAndUpdate(
          orderId,
          {
            status: "cancelled",
            paymentStatus: "unpaid",
            cancelledAt: new Date(),
          },
          { new: true }
        );

        console.log("⚫ Commande marquée comme ANNULÉE :", orderId);
      } catch (err) {
        console.error("❌ Erreur mise à jour commande expirée :", err.message);
      }
    }

    // 3️⃣ Paiement échoué
    if (event.type === "checkout.session.async_payment_failed") {
      try {
        console.log("🔴 Paiement échoué pour la commande :", orderId);

        await Order.findByIdAndUpdate(
          orderId,
          {
            status: "cancelled",
            paymentStatus: "failed",
            cancelledAt: new Date(),
          },
          { new: true }
        );

        console.log("❌ Commande marquée comme ÉCHOUÉE :", orderId);
      } catch (err) {
        console.error("❌ Erreur mise à jour commande échouée :", err.message);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;

























/*
const express = require("express");
const Stripe = require("stripe");
const Order = require("../Model/Order");
require("dotenv").config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("📩 Webhook Stripe reçu");

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Signature webhook invalide :", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("❌ orderId manquant dans metadata");
        return res.status(400).json({ error: "orderId manquant" });
      }

      try {
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            status: "confirmed",
            paymentStatus: "paid",
            paidAt: new Date(),
            stripeSessionId: session.id,
          },
          { new: true }
        );

        console.log("✅ Commande PAYÉE :", updatedOrder._id);
      } catch (err) {
        console.error("❌ Erreur mise à jour commande :", err.message);
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("❌ orderId manquant dans metadata");
        return res.status(400).json({ error: "orderId manquant" });
      }

      try {
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            status: "cancelled",
            paymentStatus: "unpaid",
            cancelledAt: new Date(),
          },
          { new: true }
        );

        console.log("⚠️ Commande ANNULÉE :", updatedOrder._id);
      } catch (err) {
        console.error("❌ Erreur mise à jour commande annulée :", err.message);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
*/






