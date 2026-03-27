// Backend/sendEmail.js
const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./mailer"); // ✔️ correction ici

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const user = new User({ nom, prenom, email, password });
    await user.save();

    // Email HTML
    const html = `
      <h2>Bienvenue, ${prenom} 🌸</h2>
      <p>Merci de vous être inscrit sur <strong>Algarve Parfume</strong>.</p>
      <p>Votre compte est maintenant actif.</p>
      <p>Connectez-vous dès maintenant pour découvrir nos parfums :</p>
      
      <a href="http://localhost:5173/Authentification"
         style="background:#c278ff;color:white;padding:10px 15px;text-decoration:none;border-radius:8px;">Se connecter</a>
      <br><br>
      <p>À bientôt 💐</p>
    `;

    // Envoi de l’email
    await sendEmail({
      to: email,
      subject: "Bienvenue sur Algarve Parfume",
      html,
      text: "Bienvenue sur Algarve Parfume ! Votre compte est maintenant actif."
    });

    res.status(201).json({ message: "Utilisateur créé avec succès. Email envoyé.", user });
  } catch (error) {
    console.error("Erreur dans register :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


