//Controllers/order.js
const Order = require("../Model/Order");
const Product = require("../Model/product");
const Cart = require("../Model/Cart");
const mongoose = require("mongoose");
const { sendEmail } = require("../utils/mailer");
const { shippedEmailTexts, deliveredEmailTexts, refundEmailTexts, orderCreatedEmailTexts } = require("../translations/emailTexts");
/*
exports.createOrder = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const { items, totalPrice, delivery } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Aucun article dans la commande" });
        }

        const enrichedItems = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.productId);
                if (!product) throw new Error(`Produit introuvable : ${item.productId}`);

                const optSize = item.options?.size;
                const optUnit = item.options?.unit || "ml";
                if (!optSize) throw new Error(`Options manquantes pour le produit : ${product.nom}`);

                const selectedOption = product.options.find(
                    (opt) =>
                        Number(opt.size) === Number(optSize) &&
                        opt.unit.toLowerCase() === optUnit.toLowerCase()
                );
                if (!selectedOption) throw new Error(`Option invalide pour le produit : ${product.nom}`);

                const variantId = selectedOption._id; // ObjectId
                return {
                    productId: product._id,
                    variantId, // ObjectId
                    nom: product.nom,
                    imageUrl: product.imageUrl,
                    quantite: Number(item.quantite || 1),
                    options: {
                        size: selectedOption.size,
                        unit: selectedOption.unit,
                        prix: selectedOption.prix,
                    },
                };
            })
        );

        const order = new Order({
            userId: req.user.userId,
            items: enrichedItems,
            totalPrice: Number(totalPrice),
            status: "pending",          // Enum valide
            paymentStatus: "unpaid",   // Enum valide
            delivery,
            createdAt: new Date(),
        });

        await order.save();
        //11/03
        const user = await User.findById(req.user.userId);
        const userLang = orderCreatedEmailTexts[user.lang]
            ? user.lang
            : "pt";

        const mailContent = orderCreatedEmailTexts[userLang];

        const html = `
  <h2>${mailContent.title}</h2>
  <p>${mailContent.hello(user.prenom)}</p> <p>${mailContent.text1(order._id)}</p><p>${mailContent.text2}</p>
  <a href="http://localhost:5173/MonCompte"
    style="
    display:inline-block;
    background:#4c6ef5;
    color:white;
    padding:12px 18px;
    border-radius:8px;
    text-decoration:none;
    font-weight:bold;">
    ${mailContent.button}
  </a>
  <br><br>
  <p>${mailContent.thanks}</p>`;

        await sendEmail({
            to: user.email,
            subject: mailContent.subject,
            html,
            text: mailContent.text1(order._id)
        });

        return res.status(201).json({
            message: "Commande créée avec succès",
            order,
        });

    } catch (error) {
        console.error("❌ Erreur création commande:", error.message);
        return res.status(500).json({ error: error.message });
    }
};
*/
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: "Commande introuvable" });

        if (order.userId.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Accès interdit" });
        }
        const updateData = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId,
            updateData,
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        if (updatedOrder.userId.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Accès interdit" });
        }

        return res.status(200).json({ message: "Commande mise à jour", order: updatedOrder });
    } catch (error) {
        console.error("Erreur mise à jour commande:", error.message);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.finalizeOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        order.status = "confirmed";
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        await order.save();

        return res.status(200).json({ message: "Commande finalisée", order });
    } catch (error) {
        console.error("Erreur finalisation commande:", error.message);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getMyOrders = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const allOrders = await Order.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });

        const preOrders = allOrders.filter(
            o => o.status === "pending" && o.paymentStatus === "unpaid"
        );

        const orders = allOrders.filter(
            o =>
                ["confirmed", "shipped", "delivered"].includes(o.status) &&
                o.paymentStatus === "paid"
        );

        const cancelledOrders = allOrders.filter(
            o => o.status === "cancelled"
        );

        const refundedOrders = allOrders.filter(
            o => o.status === "refunded"
        );

        const returnRequestedOrders = allOrders.filter(
            o => o.status === "return_requested"
        );

        return res.status(200).json({
            preOrders,
            orders,
            cancelledOrders,
            refundedOrders,
            returnRequestedOrders
        });

    } catch (error) {
        console.error("Erreur récupération commandes:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        const isOwner = order.userId.toString() === req.user.userId;
        const isAdmin = req.user.role === "admin";
        const isSeller = req.user.role === "vendeur";

        if (req.user.role === "client" && !isOwner) {
            return res.status(403).json({ message: "Accès interdit" });
        }
        if (isSeller && !isAdmin) {
        }
        await order.deleteOne();
        return res.status(200).json({ message: "Commande supprimée" });
    } catch (error) {
        console.error("Erreur suppression commande:", error.message);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("userId", "email nom prenom pays");
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Erreur récupération commandes:", error.message);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }
        const allOrders = await Order.find({ userId }).sort({ createdAt: -1 });

        // 🔴 Pré-commandes
        const preOrders = allOrders.filter(
            o => o.status === "pending" && o.paymentStatus === "unpaid"
        );

        // 🟢 Commandes payées
        const orders = allOrders.filter(
            o => o.status === "confirmed" && o.paymentStatus === "paid"
        );

        // ⚫ Commandes annulées
        const cancelledOrders = allOrders.filter(
            o => o.status === "cancelled"
        );

        return res.status(200).json({ preOrders, orders, cancelledOrders });

    } catch (error) {
        console.error("Erreur récupération commandes:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "ID commande invalide" });
        }
        const order = await Order.findById(orderId).populate("userId", "nom prenom email").populate("items.productId");

        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }
        return res.status(200).json(order);

    } catch (error) {
        console.error("Erreur récupération commande:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.shipOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const order = await Order.findById(orderId).populate("userId");

        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        if (order.status !== "confirmed") {
            return res.status(400).json({ message: "Commande non confirmée" });
        }

        order.status = "shipped";
        order.shippedAt = new Date();

        await order.save();

        // 🌍 langue utilisateur
        const userLang = shippedEmailTexts[order.userId.lang]
            ? order.userId.lang
            : "pt";

        const mailContent = shippedEmailTexts[userLang];

        const html = `
      <h2>${mailContent.title}</h2>
      <p>${mailContent.hello(order.userId.prenom)}</p>
      <p>${mailContent.text1(order._id)}</p>
      <p>${mailContent.text2}</p>

      <a href="https://www.mondialrelay.com"
        style="
        background:#4c6ef5;
        color:white;
        padding:10px 15px;
        text-decoration:none;
        border-radius:8px;">
        ${mailContent.button}
      </a>

      <br><br>

      <p>${mailContent.thanks}</p>
    `;

        await sendEmail({
            to: order.userId.email,
            subject: mailContent.subject,
            html,
            text: mailContent.text1(order._id)
        });

        res.json({
            success: true,
            message: "Commande expédiée",
            order
        });

    } catch (err) {
        console.error("Erreur shipOrder :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.deliverOrder = async (req, res) => {
    try {

        const order = await Order.findById(req.params.orderId).populate("userId");

        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        if (order.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Accès interdit" });
        }

        order.status = "delivered";
        order.deliveryStatus = "delivered";
        order.deliveredAt = new Date();

        await order.save();

        // 🌍 langue utilisateur
        const userLang = deliveredEmailTexts[order.userId.lang]
            ? order.userId.lang
            : "fr";

        const mailContent = deliveredEmailTexts[userLang];

        const html = `
      <h2>${mailContent.title}</h2>

      <p>${mailContent.hello(order.userId.prenom)}</p>

      <p>${mailContent.text1(order._id)}</p>

      <p>${mailContent.text2}</p>

      <a href="http://localhost:5173/authentification"
        style="
          display:inline-block;
          background:#4c6ef5;
          color:white;
          padding:12px 18px;
          border-radius:8px;
          text-decoration:none;
          font-weight:bold;">
        ${mailContent.button}
      </a>
    `;

        await sendEmail({
            to: order.userId.email,
            subject: mailContent.subject,
            html,
            text: mailContent.text1(order._id)
        });

        res.json({
            message: "Commande marquée comme reçue",
            order
        });

    } catch (error) {
        console.error("Erreur livraison commande :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.cancelOrder = async (req, res) => {

    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        // Vérifier que l'utilisateur est propriétaire
        if (order.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Accès interdit" });
        }

        // Vérifier que la commande n'est pas déjà expédiée
        const nonCancellableStatus = [
            "shipped",
            "in_transit",
            "out_for_delivery",
            "delivered",
            "return_requested",
            "returned",
            "refunded"
        ];

        if (nonCancellableStatus.includes(order.status)) {
            return res.status(400).json({ message: "Commande non annulable" });
        }

        // Restaurer les articles dans le panier
        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) {
            cart = new Cart({ userId: req.user.userId, items: [] });
        }

        order.items.forEach(item => cart.items.push(item));
        await cart.save();

        // Annuler la commande
        order.status = "cancelled";
        await order.save();
        const html = `
  <h2>${t("email.order_canceled.title")}</h2>

  <p>${t("email.order_canceled.hello", { name: order.userId.prenom })}</p>

  <p>${t("email.order_canceled.text1", { orderId: order._id })}</p>

  <p>${t("email.order_canceled.text2")}</p>

  <a href="http://localhost:5173/panier"
     style="background:#4c6ef5;color:white;padding:10px 15px;text-decoration:none;border-radius:8px;display:inline-block;">
     ${t("email.order_canceled.button")}
  </a>

  <p>${t("email.order_canceled.text3")}</p>

  <br><br>
  <p>${t("email.order_canceled.thanks")}</p>
`;

        await sendEmail({
            to: order.userId.email,
            subject: t("email.order_canceled.subject"),
            html,
            text: t("email.order_canceled.text1", { orderId: order._id })
        });

        return res.json({
            message: "Commande annulée et panier restauré",
            order
        });

    } catch (err) {
        console.error("Erreur annulation commande :", err);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "nom email") // infos client
            .populate("products.product", "nom prix"); // infos produits

        // Calcul du chiffre d'affaires total
        const totalRevenue = orders.reduce((sum, order) => {
            return sum + order.products.reduce((s, p) => s + p.quantity * p.product.prix, 0);
        }, 0);

        res.json({
            totalRevenue,
            totalOrders: orders.length,
            orders
        });
    } catch (err) {
        console.error("Erreur récupération commandes admin :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.refundOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate("userId");
        if (!order) return res.status(404).json({ message: "Commande introuvable" });

        if (order.status !== "returned") {
            return res.status(400).json({ message: "Remboursement non autorisé pour ce statut" });
        }

        // Cas 2 : commande non payée ou en attente
        if (order.paymentStatus !== "paid") {
            // Si statut pending : annulation possible
            if (order.status === "pending") {
                order.status = "cancelled";
                await order.save();
                return res.status(200).json({ message: "Commande annulée avec succès", order });
            } else {
                return res.status(400).json({ message: "Impossible de rembourser une commande non payée" });
            }
        }

        // Cas 1 : commande confirmée (payée mais pas livrée)
        if (order.status === "confirmed") {
            order.status = "refunded";
            order.paymentStatus = "refunded";
            order.refundedAt = new Date();
            await order.save();
            await sendRefundEmail(order);
            return res.status(200).json({ message: "Commande remboursée", order });
        }

        // Cas 4 : commande expédiée mais pas livrée
        if (order.status === "shipped") {
            // Vérifier que livraison n'a pas eu lieu
            order.status = "refunded";
            order.paymentStatus = "refunded";
            order.refundedAt = new Date();
            await order.save();
            await sendRefundEmail(order);
            return res.status(200).json({ message: "Commande remboursée (livraison échouée)", order });
        }

        // Cas 3 : produit livré, retour nécessaire
        if (order.status === "delivered") {
            return res.status(400).json({
                message: "Produit livré : le remboursement nécessite un retour. Veuillez créer une demande de retour."
            });
        }

        // Cas par défaut
        return res.status(400).json({ message: "Remboursement non autorisé pour ce statut" });

    } catch (error) {
        console.error("Erreur remboursement :", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
async function sendRefundEmail(order) {

    const userLang = refundEmailTexts[order.userId.lang]
        ? order.userId.lang
        : "pt";

    const mailContent = refundEmailTexts[userLang];
    const html = `
    <h2>${mailContent.title}</h2>
    <p>${mailContent.hello(order.userId.prenom)}</p>
    <p>${mailContent.text1(order._id)}</p>
    <p>${mailContent.amount(order.totalPrice)}</p>

    <a href="http://localhost:5173/MonCompte"
      style="
      display:inline-block;
      background:#4c6ef5;
      color:white;
      padding:12px 18px;
      border-radius:8px;
      text-decoration:none;
      font-weight:bold;">
      ${mailContent.button}
    </a>

    <br><br>

    <p>${mailContent.thanks}</p>
  `;

    await sendEmail({
        to: order.userId.email,
        subject: mailContent.subject,
        html,
        text: mailContent.text1(order._id)
    });

}

exports.createOrder = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const { items, totalPrice, delivery } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Aucun article dans la commande" });
        }

        const enrichedItems = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.productId);
                if (!product) throw new Error(`Produit introuvable : ${item.productId}`);

                const optSize = item.options?.size;
                const optUnit = item.options?.unit || "ml";
                if (!optSize) throw new Error(`Options manquantes pour le produit : ${product.nom}`);

                const selectedOption = product.options.find(
                    (opt) =>
                        Number(opt.size) === Number(optSize) &&
                        opt.unit.toLowerCase() === optUnit.toLowerCase()
                );
                if (!selectedOption) throw new Error(`Option invalide pour le produit : ${product.nom}`);

                const variantId = selectedOption._id; // ObjectId
                return {
                    productId: product._id,
                    variantId, // ObjectId
                    nom: product.nom,
                    imageUrl: product.imageUrl,
                    quantite: Number(item.quantite || 1),
                    options: {
                        size: selectedOption.size,
                        unit: selectedOption.unit,
                        prix: selectedOption.prix,
                    },
                };
            })
        );

        const order = new Order({
            userId: req.user.userId,
            items: enrichedItems,
            totalPrice: Number(totalPrice),
            status: "pending",          // Enum valide
            paymentStatus: "unpaid",   // Enum valide
            delivery,
            createdAt: new Date(),
        });

        await order.save();

        return res.status(201).json({
            message: "Commande créée avec succès",
            order,
        });

    } catch (error) {
        console.error("❌ Erreur création commande:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

