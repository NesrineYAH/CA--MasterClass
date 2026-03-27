const bcrypt = require("bcrypt");
const User = require("../Model/User");
const mongoose = require("mongoose");
require("dotenv").config();
require("../mongoDB/DB.js");

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/parfumesShopsDB")
  .then(() => console.log("✅ Connexion MongoDB réussie"))
  .catch((err) => console.error("❌ Erreur de connexion MongoDB :", err));

async function recreateUsers() {
  const users = [
    {
      name: "Nesrine yahoum",
      email: "process.env.EMAIL_ADMIN",
      password: "process.env.EMAIL_PasswordADMIN", 
      role: "admin",
    },
    {
      name: "BEKKAR ABED",
      email: "process.env.EMAIL_VENDEUR",
      password: "process.env.EMAIL_PasswordVendeur",
      role: "vendeur",
    },
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = new User({
      name: u.name,
      email: u.email,
      password: hashed,
      role: u.role,
    });
    await user.save();
    console.log(`Utilisateur ${u.email} recréé avec succès.`);
  }
  mongoose.disconnect();
}
recreateUsers();
