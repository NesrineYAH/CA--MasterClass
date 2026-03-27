// checkAllUsers.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./Model/userModel");

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);

    const users = await User.find({});

    console.log("🔍 ÉTAT DE TOUS LES UTILISATEURS:");
    console.log("================================");

    users.forEach((user) => {
      const hash = user.password;
      const isValid =
        hash.startsWith("$2a$") ||
        hash.startsWith("$2b$") ||
        hash.startsWith("$2y$");

      console.log(`📧 ${user.email}`);
      console.log(`   👤 ${user.username}`);
      console.log(`   🔐 Hash: ${hash.substring(0, 30)}...`);
      console.log(`   ✅ Valide: ${isValid ? "OUI" : "NON ❌"}`);
      console.log("   ---");
    });

    console.log(`📊 Total: ${users.length} utilisateur(s)`);
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await mongoose.connection.close();
  }
}

checkAllUsers();
