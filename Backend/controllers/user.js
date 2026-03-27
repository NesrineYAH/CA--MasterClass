//  controllers/users.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Model/User");
const Order = require("../Model/Order");
const { body } = require("express-validator");
require("dotenv").config();
const { sendEmail } = require("../utils/mailer");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { emailTexts, resetEmailTexts } = require("../translations/emailTexts");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,32}$/;
const signatureToken = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password, lang } = req.body;

    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Email invalide" });

    if (!passwordRegex.test(password))
      return res.status(400).json({
        message:
          "Mot de passe invalide (8-32 caractères, 1 majuscule, 1 chiffre, 1 spécial !@#$%^&*)",
      });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Cet email est déjà utilisé." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedLang = lang ? lang.slice(0, 2) : "pt";
    const userLang = emailTexts[normalizedLang] ? normalizedLang : "pt";

    const mailContent = emailTexts[userLang];

    const user = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      lang: userLang
    });

    await user.save();

    await sendEmail({
      to: email,
      subject: mailContent.subject,
      text: mailContent.text(prenom),
      html: mailContent.html(prenom),
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        lang: user.lang
      }
    });

  } catch (error) {
    console.error("Erreur dans register :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Paire login/mot de passe incorrecte" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ message: "Paire login/mot de passe incorrecte" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email
      },
      signatureToken,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    //      token,
    res.status(200).json({
      user: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur dans login :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.validate = (method) => {
  switch (method) {
    case "register":
      return [
        body("email", "Email invalide").isEmail(),
        body(
          "password",
          "Mot de passe invalide (min 8 caractères, majuscule, chiffre, caractère spécial)"
        ).matches(passwordRegex),
      ];
    case "login":
      return [
        body("email", "Email invalide").isEmail(),
        body("password", "Mot de passe requis").notEmpty(),
      ];
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email introuvable" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // langue utilisateur
    const userLang = resetEmailTexts[user.lang] ? user.lang : "fr";
    const mailContent = resetEmailTexts[userLang];

    await sendEmail({
      to: email,
      subject: mailContent.subject,
      html: `
        <p>${mailContent.line1}</p>
        <p>${mailContent.line2}</p>
        <a href="${resetLink}" style="
          display:inline-block;
          padding:10px 20px;
          background:#000;
          color:#fff;
          text-decoration:none;
          border-radius:5px;">
          ${mailContent.button}
        </a>
        <p>${mailContent.expire}</p>
      `
    });

    res.json({ message: "Email envoyé !" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.user.userId; // depuis JWT
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mot de passe actuel et nouveau mot de passe requis" });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Mot de passe invalide (8-32 caractères, 1 majuscule, 1 chiffre, 1 spécial !@#$%^&*)",
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe actuel incorrect" });

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ message: "Le nouveau mot de passe ne peut pas être identique à l'ancien" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Mot de passe modifié avec succès !" });

  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclure le mot de passe
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur récupération utilisateurs :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur récupération utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.getUserOrders = async (req, res) => {
  try {
    // const userId = req.params.userId;
    const userId = req.user.userId; // ⭐ ID du token, fiable
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    const preOrders = orders.filter(
      (o) => o.status !== "paid" && o.status !== "cancelled"
    );

    const paidOrders = orders.filter(
      (o) => o.status === "paid"
    );

    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled"
    );

    res.json({
      preOrders,
      orders: paidOrders,
      cancelledOrders,
    });

  } catch (err) {
    console.error("Erreur getUserOrders :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // true en production HTTPS
    sameSite: "lax",
  });

  res.status(200).json({ message: "Déconnexion réussie" });
};

exports.getCurrentUser = async (req, res) => {
  try {
    // req.user est déjà rempli par authMiddleware
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("Erreur getCurrentUser :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


exports.getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    const users = await User.find({ role });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId; // récupéré via ton middleware auth
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    // Récupérer le user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    // Hasher le nouveau mot de passe
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès" });

  } catch (error) {
    console.error("Erreur changePassword :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { phone, preferences, email } = req.body;
    const updateFields = {};

    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return res.status(400).json({ message: "Numéro de téléphone invalide" });
      }
      updateFields.phone = phone;
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        return res.status(400).json({ message: "Email invalide" });
      }
      updateFields.email = email;
    }

    if (preferences !== undefined) {
      updateFields.preferences = preferences;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        context: "query"   // 🔥 IMPORTANT
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({
      message: "Préférences mises à jour avec succès",
      user,
    });

  } catch (error) {
    console.error("updatePreferences error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



/*
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Mot de passe actuel et nouveau mot de passe requis",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Mot de passe actuel incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Mot de passe modifié avec succès !" });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};*/



/*
 Conclusion

👉 Oui, tu dois utiliser user._id quand tu signes le token  
👉 Et userId dans le payload du JWT est parfait  
👉 Tu n’as rien à changer ici
*/



