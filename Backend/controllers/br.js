//controllers/return.js 
const Return = require("../Model/Return.js");
const Order = require("../Model/Order.js");
const { sendEmail } = require("../utils/mailer.js");
const { generateReturnLabel } = require("../utils/generateReturnLabel");

exports.createReturnRequest = async (req, res) => {
  try {
    const dbUser = req.user;
    const { orderId, products, reason, description } = req.body;

    const formattedProducts = products.map(p => {
      if (typeof p === "string") {
        return { productId: p };
      }
      if (p._id) { return { productId: p._id }; }
      if (p.productId) { return { productId: p.productId }; }
      throw new Error("Format produit invalide dans la demande de retour");
    });


    if (!orderId || !formattedProducts || formattedProducts.length === 0 || !reason) {
      return res.status(400).json({ message: "Données invalides" });
    }



    const newReturn = new Return({
      userId: dbUser._id,
      orderId,
      products: formattedProducts,
      reason,
      description,
    });

    await newReturn.save();

    const order = await Order.findById(orderId);

    for (const item of formattedProducts) {
      const product = order.items.find(
        p => p.productId.toString() === String(item.productId)
      );

      if (product) {
        product.returnStatus = "requested";
      }
    }

    await order.save();

    const labelLinks = [];
    for (const item of formattedProducts) {
      const labelPath = await generateReturnLabel({
        returnId: newReturn._id,
        orderId,
        productId: item.productId,
        user: dbUser,

      });

      labelLinks.push(labelPath);
    }

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
        background: #ff4f9a; /* Rose */
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
    </style>
  </head>

  <body>
    <div class="container">
      <h2>Demande de retour confirmée</h2>

      <p>Bonjour ${req.user.prenom},</p>

      <p>
        Votre demande de retour pour la commande
        <strong>${orderId}</strong> a bien été enregistrée.
      </p>

      <p><strong>Raison :</strong> ${reason}</p>
      ${description ? `<p><strong>Détails :</strong> ${description}</p>` : ""}

      <h3>📦 Étiquette(s) de retour</h3>

      <div class="labels">
        ${labelLinks
        .map(
          (link) => `
              <a class="btn" href="${link}" target="_blank">
                📄 Télécharger l’étiquette
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
      // to: req.user.email,
      to: dbUser.email,
      subject: "Confirmation de votre retour",
      html,
      text: "Votre demande de retour a bien été enregistrée.",
    });


    res.status(201).json({
      success: true,
      message: "Demande de retour créée avec succès",
    });
  } catch (error) {
    console.error("❌ Create return error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};