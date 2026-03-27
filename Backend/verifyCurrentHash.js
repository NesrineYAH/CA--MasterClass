// verifyCurrentHash.js
require("dotenv").config();
const mongoose = require("mongoose");
const argon2 = require("argon2");
const User = require("./Model/userModel");

async function verifyHash() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);

    const email = "nesrinehadil87@gmail.com";
    const user = await User.findOne({ email });

    console.log("🔍 VÉRIFICATION HASH ACTUEL");
    console.log("📧 Email:", user.email);
    console.log("💾 Hash:", user.password);

    // Tester différents mots de passe
    const testPasswords = [
      "Hadil18*",
      "Hadil18",
      "Hadil18* ",
      " Hadil18*",
      "Hadil123",
      "hadil18*",
      "HADIL18*",
    ];

    console.log("\n🔐 TESTS MULTIPLES:");
    for (const testPwd of testPasswords) {
      try {
        const match = await argon2.verify(user.password, testPwd);
        console.log(
          `   "${testPwd}" → ${match ? "✅ CORRECT" : "❌ incorrect"}`
        );
      } catch (error) {
        console.log(`   "${testPwd}" → 💥 Erreur`);
      }
    }
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await mongoose.connection.close();
  }
}

verifyHash();
