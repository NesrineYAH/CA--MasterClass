// routes/addresse
const express = require("express");
const router = express.Router();
const { addAddress, getAddresses, deleteAddress, updateAddress } = require("../controllers/address");
const { authMiddleware } = require("../middleware/auth"); // vérifie que l'utilisateur est connecté

// 🔹 Ajouter une adresse
router.post("/", authMiddleware, addAddress);

// 🔹 Récupérer toutes les adresses de l'utilisateur connecté
router.get("/", authMiddleware, getAddresses);

// 🔹 Supprimer une adresse
router.delete("/:id", authMiddleware, deleteAddress);

// 🔹 Mettre à jour une adresse
router.put("/:id", authMiddleware, updateAddress);

module.exports = router;

