// completeUserReset.js
require("dotenv").config();
const mongoose = require("mongoose");
const argon2 = require("argon2");
const User = require("./Model/userModel");

async function completeReset() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);

    const email = "nesrinehadil87@gmail.com";

    console.log("🗑️ SUPPRESSION de l'utilisateur...");
    await User.deleteOne({ email: email });

    console.log("🔄 CRÉATION du nouvel utilisateur...");
    const user = new User({
      username: "Hadil",
      email: email,
      password: await argon2.hash("Hadil123"),
    });

    await user.save();

    console.log("🎉 NOUVEL UTILISATEUR CRÉÉ!");
    console.log("📧 Email:", user.email);
    console.log("👤 Username:", user.username);
    console.log("🔑 Mot de passe: Hadil123");
    console.log("💾 Hash:", user.password);

    // VÉRIFICATION IMMÉDIATE
    console.log("\n🔐 VÉRIFICATION IMMÉDIATE...");
    const userFromDB = await User.findOne({ email });
    const testMatch = await argon2.verify(userFromDB.password, "Hadil123");
    console.log("✅ Test argon2.verify:", testMatch ? "SUCCÈS" : "ÉCHEC");

    if (testMatch) {
      console.log("\n🚀 MAINTENANT TESTEZ LA CONNEXION!");
      console.log("Email: nesrinehadil87@gmail.com");
      console.log("Mot de passe: Hadil123");
    }
  } catch (error) {
    console.error("💥 Erreur:", error);
  } finally {
    await mongoose.connection.close();
  }
}

completeReset();
