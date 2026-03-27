// migrateToArgon2.js
require("dotenv").config();
const mongoose = require("mongoose");
const argon2 = require("argon2");
const User = require("./Model/userModel");

async function migrateToArgon2() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);

    console.log("🔄 MIGRATION VERS ARGON2...");

    const users = await User.find({});

    const newPasswords = {
      "yahouamesrine@gmail.com": "Nesrine123!",
      "benyoucefy99@yahoo.fr": "Benyou123!",
      "babosaidas7@gmail.com": "Saida87",
      "test@test.com": "Test1234!",
      "babosaida87@gmail.com": "Saida87",
    };

    for (const user of users) {
      console.log(`\n🔧 Migration: ${user.email}`);

      const newPassword = newPasswords[user.email] || "Password123!";

      // Générer un nouveau hash avec Argon2
      const newHash = await argon2.hash(newPassword);

      // Sauvegarder
      user.password = newHash;
      await user.save();

      // Vérification
      const testMatch = await argon2.verify(newHash, newPassword);
      console.log(`✅ ${user.email}: ${testMatch ? "SUCCÈS" : "ÉCHEC"}`);
      console.log(`🔑 Mot de passe: ${newPassword}`);
    }

    console.log("\n🎉 MIGRATION TERMINÉE!");
    console.log("\n📋 NOUVEAUX IDENTIFIANTS:");
    Object.entries(newPasswords).forEach(([email, password]) => {
      console.log(`📧 ${email} | 🔑 ${password}`);
    });
  } catch (error) {
    console.error("💥 Erreur:", error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateToArgon2();
