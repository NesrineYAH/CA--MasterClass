// models/User.js
const mongoose = require("mongoose");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
});
/*
// Hash avant save avec argon2
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});
*/
// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    console.error("Erreur argon2.verify:", error);
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
