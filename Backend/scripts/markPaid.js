// Backend/scripts/markPaid.js
const mongoose = require("mongoose");
const Order = require("../Model/Order"); // adapte le chemin
require("../mongoDB/DB"); // connexion DB

async function markPendingPaid(orderId) {
    const order = await Order.findByIdAndUpdate(orderId, {
        status: "paid",
        paymentStatus: "paid",
        paidAt: new Date(),
    }, { new: true });

    console.log("Commande mise à jour :", order);
}

// Remplace avec ton orderId
markPendingPaid("6973ee98119fb2e5af351e73")
    .then(() => {
        console.log("✅ Terminé");
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
