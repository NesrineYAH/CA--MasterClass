const User = require("../Model/userModel.js");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Regex pour validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,32}$/;
const signatureToken = process.env.CLE_TOKEN;

// Register  argon2
exports.Register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const hashedPassword = await argon2.hash(password);

    const user = new User({
      email,
      password: hashedPassword,
      username,
    });

    await user.save();
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/*
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const match = await argon2.verify(user.password, password);

    if (!match) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // ... génération du token
    res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      token: token,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
*/
//temporaire
// Dans userController.js - debug encodage
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=== 🚨 DEBUG ENCODAGE ===");
    console.log("🔑 Password reçu:", `"${password}"`);
    console.log("📏 Longueur:", password.length);
    console.log("🔤 Chars individuels:");
    for (let i = 0; i < password.length; i++) {
      console.log(
        `   ${i}: '${password[i]}' (code: ${password.charCodeAt(i)})`
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Test avec différentes variantes
    console.log("\n🔐 TESTS MULTIPLES:");

    // Test 1: Password original
    const test1 = await argon2.verify(user.password, password);
    console.log(`   Original "${password}": ${test1}`);

    // Test 2: Password trimé
    const test2 = await argon2.verify(user.password, password.trim());
    console.log(`   Trimmed "${password.trim()}": ${test2}`);

    // Test 3: Sans le *
    if (password.includes("*")) {
      const withoutStar = password.replace("*", "");
      const test3 = await argon2.verify(user.password, withoutStar);
      console.log(`   Sans * "${withoutStar}": ${test3}`);
    }

    if (!test1) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // ... reste du code
  } catch (err) {
    console.error("💥 Erreur:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur getProfile:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
