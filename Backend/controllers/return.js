//controllers/return.js 
const Return = require("../Model/Return.js");
const Order = require("../Model/Order.js");
const { sendEmail } = require("../utils/mailer.js");
const { generateReturnLabel } = require("../utils/generateReturnLabel");
const { returnRequestEmailTexts } = require("../translations/emailTexts.js")

exports.createReturnRequest = async (req, res) => {
  try {
    const dbUser = req.user;
    const { orderId, products, reason, description } = req.body;

    if (!orderId || !products || products.length === 0 || !reason) {
      return res.status(400).json({ message: "Données invalides" });
    }

    for (const product of products) {
      if (!product.productId || !product.variantId) {
        return res.status(400).json({
          message: "Chaque produit doit avoir productId et variantId"
        });
      }
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const existing = await Return.findOne({
      orderId,
      "products.productId": products[0].productId
    });

    /*    if (existing) {
          return res.json(existing);
        }*/
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Un retour existe déjà pour ce produit",
        return: existing
      });
    }

    if (order.userId.toString() !== dbUser._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const newReturn = new Return({
      userId: dbUser._id,
      orderId,
      products: products.map(p => ({
        productId: p.productId,
        variantId: p.variantId,
        quantity: p.quantity || 1,
      })),
      reason,
      description: description || "",
      status: "pending",
      returnLabels: [],
    });

    await newReturn.save();

    for (const returnProduct of products) {
      const orderItem = order.items.find(
        item =>
          item.productId.toString() === returnProduct.productId.toString() &&
          item.variantId.toString() === returnProduct.variantId.toString()
      );

      if (orderItem) {
        orderItem.returnStatus = "requested";
        orderItem.returnId = newReturn._id;
      }
    }

    await order.save();

    const labelLinks = [];

    for (const product of products) {
      const labelPath = await generateReturnLabel({
        returnId: newReturn._id,
        orderId,
        productId: product.productId,
        variantId: product.variantId,
        quantity: product.quantity || 1,
        user: dbUser,
      });

      labelLinks.push(labelPath);
    }

    newReturn.returnLabels = labelLinks;
    await newReturn.save();

    // 🌍 Langue utilisateur
    const lang = dbUser.lang || "pt";
    const mail = returnRequestEmailTexts[lang] || returnRequestEmailTexts.pt;

    // 📧 EMAIL HTML (CSS IDENTIQUE)
    const html = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f2f2f2;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      h2 {
        text-align: center;
        font-size: 26px;
        color: #333;
        margin-bottom: 20px;
      }
      .btn {
        display: inline-block;
        background: #7a196d;
        color: white;
        padding: 12px 18px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .btn:hover {
        background: #e04388;
      }
      p, li {
        font-size: 15px;
        color: #444;
      }
      .labels {
        margin-top: 20px;
        text-align: center;
      }
      .product-list {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <h2>${mail.title}</h2>
      <p>${mail.hello(dbUser.prenom || dbUser.name || "")}</p>
      <p>${mail.orderText(orderId)}</p>
      <div class="product-list">
        <h3>${mail.productsTitle}</h3>
        <ul>
          ${products.map(p => {
      const orderItem = order.items.find(
        item =>
          item.productId.toString() === p.productId.toString() &&
          item.variantId.toString() === p.variantId.toString()
      );

      return `<li>
              ${orderItem?.nom || "Produit"}
              (${orderItem?.options?.size || ""}${orderItem?.options?.unit || ""})
              - Quantité: ${p.quantity || 1}
            </li>`;
    }).join("")}
        </ul>
      </div>

      <p><strong>${mail.reason}</strong> ${reason}</p>

      ${description ? `<p><strong>${mail.details}</strong> ${description}</p>` : ""}

      <h3>${mail.labelsTitle}</h3>

      <div class="labels">
        ${labelLinks
        .map(
          (link, index) => `
              <a class="btn" href="${link}" target="_blank">
                ${mail.downloadLabel(labelLinks.length > 1 ? index + 1 : "")}
              </a>
            `
        )
        .join("<br>")}
      </div>

      <p style="margin-top:25px;">
        ${mail.thanks}
      </p>

    </div>
  </body>
</html>
`;

    await sendEmail({
      to: dbUser.email,
      subject: mail.subject,
      html,
      text: mail.orderText(orderId),
    });

    res.status(201).json({
      success: true,
      message: "Demande de retour créée avec succès",
      returnId: newReturn._id,
    });

  } catch (error) {
    console.error("❌ Create return error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.approveReturn = async (req, res) => {
  try {
    const { returnId } = req.params;


    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Demande de retour introuvable" });
    }


    returnRequest.status = "approved";
    await returnRequest.save();


    const order = await Order.findById(returnRequest.orderId);

    returnRequest.products.forEach(item => {
      const product = order.items.find(
        p => p.productId.toString() === item.productId.toString()
      );
      if (product) {
        product.returnStatus = "approved";
      }
    });

    await order.save();

    res.json({
      success: true,
      message: "Retour approuvé",
    });

  } catch (err) {
    console.error("Approve return error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.refundProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    const returnRequest = await Return.findOne({
      orderId,
      productId,
      status: "approved"
    });

    if (!returnRequest) {
      return res.status(400).json({ message: "Retour non approuvé" });
    }

    returnRequest.status = "refunded";
    await returnRequest.save();

    const order = await Order.findById(orderId);
    const item = order.items.find(
      p => p.productId.toString() === productId
    );

    item.returnStatus = "refunded";

    const allRefunded = order.items.every(i =>
      ["none", "refunded"].includes(i.returnStatus)
    );

    if (allRefunded) {
      order.status = "refunded";
      order.paymentStatus = "refunded";
      order.refundedAt = new Date();
    }

    await order.save();

    await sendEmail({
      to: req.user.email,
      subject: "Remboursement effectué",
      text: "Votre produit a été remboursé."
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.markAsReturned = async (req, res) => {
  try {
    console.log("📩 Requête reçue sur /:orderId/:productId/received");

    // Vérifier les params
    console.log("➡️ req.params =", req.params);

    const { orderId, productId } = req.params;

    console.log("🔍 Recherche du retour :", {
      orderId,
      productId
    });

    const returnRequest = await Return.findOne({
      orderId,
      "products.productId": productId,
      status: "approved"
    });

    console.log("📦 Résultat Return.findOne =", returnRequest);

    if (!returnRequest) {
      console.log("❌ Aucun retour trouvé !");
      return res.status(404).json({ message: "Retour non trouvé ou non approuvé" });
    }

    console.log("✅ Retour trouvé, mise à jour du statut → returned");

    returnRequest.status = "returned";
    await returnRequest.save();

    console.log("💾 Retour mis à jour :", returnRequest);

    const order = await Order.findById(orderId);
    console.log("🧾 Commande trouvée :", order ? "OK" : "NON TROUVÉE");

    const item = order.items.find(
      p => p.productId.toString() === productId
    );

    console.log("🔎 Produit dans la commande :", item);

    if (!item) {
      console.log("❌ Produit introuvable dans la commande !");
      return res.status(404).json({ message: "Produit introuvable dans la commande" });
    }

    item.returnStatus = "returned";
    await order.save();

    console.log("💾 Commande mise à jour avec returnStatus=returned");

    res.json({ success: true, message: "Colis marqué comme retourné" });

  } catch (err) {
    console.error("🔥 ERREUR SERVEUR :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};










/*
//12/03/2026
exports.createReturnRequest = async (req, res) => {
  try {
    const dbUser = req.user;
    const { orderId, products, reason, description } = req.body;

    if (!orderId || !products || products.length === 0 || !reason) {
      return res.status(400).json({ message: "Données invalides" });
    }

    for (const product of products) {
      if (!product.productId || !product.variantId) {
        return res.status(400).json({
          message: "Chaque produit doit avoir productId et variantId"
        });
      }
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const existing = await Return.findOne({
      orderId,
      "products.productId": products[0].productId
    });

    if (existing) {
      return res.json(existing);
    }

    if (order.userId.toString() !== dbUser._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const newReturn = new Return({
      userId: dbUser._id,
      orderId,
      products: products.map(p => ({
        productId: p.productId,
        variantId: p.variantId,
        quantity: p.quantity || 1,
      })),
      reason,
      description: description || "",
      status: "pending",
      returnLabels: [],
    });

    await newReturn.save();

    for (const returnProduct of products) {
      const orderItem = order.items.find(
        item =>
          item.productId.toString() === returnProduct.productId.toString() &&
          item.variantId.toString() === returnProduct.variantId.toString()
      );

      if (orderItem) {
        orderItem.returnStatus = "requested";
        orderItem.returnId = newReturn._id;
      }
    }

    await order.save();

    const labelLinks = [];

    for (const product of products) {
      const labelPath = await generateReturnLabel({
        returnId: newReturn._id,
        orderId,
        productId: product.productId,
        variantId: product.variantId,
        quantity: product.quantity || 1,
        user: dbUser,
      });

      labelLinks.push(labelPath);
    }

    newReturn.returnLabels = labelLinks;
    await newReturn.save();

    // 🌍 Langue utilisateur
    const lang = dbUser.lang || "pt";
    const mail = returnRequestEmailTexts[lang] || returnRequestEmailTexts.pt;

    // 📧 EMAIL HTML (CSS IDENTIQUE)
    const html = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f2f2f2;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      h2 {
        text-align: center;
        font-size: 26px;
        color: #333;
        margin-bottom: 20px;
      }
      .btn {
        display: inline-block;
        background: #ff4f9a;
        color: white;
        padding: 12px 18px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .btn:hover {
        background: #e04388;
      }
      p, li {
        font-size: 15px;
        color: #444;
      }
      .labels {
        margin-top: 20px;
        text-align: center;
      }
      .product-list {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
      }
    </style>
  </head>

  <body>
    <div class="container">

      <h2>${mail.title}</h2>

      <p>${mail.hello(dbUser.prenom || dbUser.name || "")}</p>

      <p>${mail.orderText(orderId)}</p>

      <div class="product-list">
        <h3>${mail.productsTitle}</h3>

        <ul>
          ${products.map(p => {
      const orderItem = order.items.find(
        item =>
          item.productId.toString() === p.productId.toString() &&
          item.variantId.toString() === p.variantId.toString()
      );

      return `<li>
              ${orderItem?.nom || "Produit"}
              (${orderItem?.options?.size || ""}${orderItem?.options?.unit || ""})
              - Quantité: ${p.quantity || 1}
            </li>`;
    }).join("")}
        </ul>
      </div>

      <p><strong>${mail.reason}</strong> ${reason}</p>

      ${description ? `<p><strong>${mail.details}</strong> ${description}</p>` : ""}

      <h3>${mail.labelsTitle}</h3>

      <div class="labels">
        ${labelLinks
        .map(
          (link, index) => `
              <a class="btn" href="${link}" target="_blank">
                ${mail.downloadLabel(labelLinks.length > 1 ? index + 1 : "")}
              </a>
            `
        )
        .join("<br>")}
      </div>

      <p style="margin-top:25px;">
        ${mail.thanks}
      </p>

    </div>
  </body>
</html>
`;

    await sendEmail({
      to: dbUser.email,
      subject: mail.subject,
      html,
      text: mail.orderText(orderId),
    });

    res.status(201).json({
      success: true,
      message: "Demande de retour créée avec succès",
      returnId: newReturn._id,
    });

  } catch (error) {
    console.error("❌ Create return error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
*/

/*
exports.createReturnRequest = async (req, res) => {
  try {
    const dbUser = req.user;
    const { orderId, products, reason, description } = req.body;

    // 🔁 Validation que chaque produit a productId ET variantId
    if (!orderId || !products || products.length === 0 || !reason) {
      return res.status(400).json({ message: "Données invalides" });
    }

    // ✅ Vérification que chaque produit a bien productId et variantId
    for (const product of products) {
      if (!product.productId || !product.variantId) {
        return res.status(400).json({
          message: "Chaque produit doit avoir productId et variantId"
        });
      }
    }

    // 1️⃣ Vérifier que la commande existe
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    // 2️⃣ Vérifier qu’un retour identique n’existe pas déjà
    const existing = await Return.findOne({
      orderId, "products.productId":
        products[0].productId
    }); if (existing) {
      return res.json(existing);
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (order.userId.toString() !== dbUser._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // 🟢 2. Création du retour - EXACTEMENT comme votre modèle
    const newReturn = new Return({
      userId: dbUser._id,
      orderId,
      products: products.map(p => ({
        productId: p.productId,
        variantId: p.variantId,
        quantity: p.quantity || 1, // quantity est optionnel, default 1
      })),
      reason,
      description: description || "",
      status: "pending", // default du modèle
      returnLabels: [], // sera rempli après génération
    });

    await newReturn.save();

    // 🟢 3. Mettre à jour les items de la commande avec returnStatus
    for (const returnProduct of products) {
      const orderItem = order.items.find(
        item =>
          item.productId.toString() === returnProduct.productId.toString() &&
          item.variantId.toString() === returnProduct.variantId.toString()
      );

      if (orderItem) {
        orderItem.returnStatus = "requested";
        orderItem.returnId = newReturn._id; // ⭐ OBLIGATOIRE pour faire le lien entre l'item de la commande et la demande de retour
      }

    }

    await order.save();

    // 🟢 4. Génération des étiquettes de retour
    const labelLinks = [];

    for (const product of products) {
      const labelPath = await generateReturnLabel({
        returnId: newReturn._id,
        orderId,
        productId: product.productId,
        variantId: product.variantId,
        quantity: product.quantity || 1,
        user: dbUser,
      });

      labelLinks.push(labelPath);
    }

    // ✅ Mettre à jour le retour avec les liens des étiquettes
    newReturn.returnLabels = labelLinks;
    await newReturn.save();

    // 🟢 5. Email de confirmation
    const html = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f2f2f2;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      h2 {
        text-align: center;
        font-size: 26px;
        color: #333;
        margin-bottom: 20px;
      }
      .btn {
        display: inline-block;
        background: #ff4f9a;
        color: white;
        padding: 12px 18px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .btn:hover {
        background: #e04388;
      }
      p, li {
        font-size: 15px;
        color: #444;
      }
      .labels {
        margin-top: 20px;
        text-align: center;
      }
      .product-list {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Demande de retour confirmée</h2>

      <p>Bonjour ${dbUser.prenom || dbUser.name || ""},</p>

      <p>
        Votre demande de retour pour la commande
        <strong>${orderId}</strong> a bien été enregistrée.
      </p>

      <div class="product-list">
        <h3>Produits retournés :</h3>
        <ul>
          ${products.map(p => {
      const orderItem = order.items.find(
        item =>
          item.productId.toString() === p.productId.toString() &&
          item.variantId.toString() === p.variantId.toString()
      );
      return `<li>${orderItem?.nom || "Produit"} (${orderItem?.options?.size || ""}${orderItem?.options?.unit || ""}) - Quantité: ${p.quantity || 1}</li>`;
    }).join("")}
        </ul>
      </div>

      <p><strong>Raison :</strong> ${reason}</p>
      ${description ? `<p><strong>Détails :</strong> ${description}</p>` : ""}

      <h3>📦 Étiquette(s) de retour</h3>

      <div class="labels">
        ${labelLinks
        .map(
          (link, index) => `
              <a class="btn" href="${link}" target="_blank">
                📄 Télécharger l’étiquette ${labelLinks.length > 1 ? `#${index + 1}` : ""}
              </a>
            `
        )
        .join("<br>")
      }
      </div>

      <p style="margin-top: 25px;">Merci pour votre confiance.</p>
    </div>
  </body>
</html>
`;

    await sendEmail({
      to: dbUser.email,
      subject: "Confirmation de votre retour",
      html,
      text: "Votre demande de retour a bien été enregistrée.",
    });

    // 🟢 Réponse finale
    res.status(201).json({
      success: true,
      message: "Demande de retour créée avec succès",
      returnId: newReturn._id,
    });

  } catch (error) {
    console.error("❌ Create return error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
*/
