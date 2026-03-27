// routes/avis.js
const express = require("express");
const router = express.Router();
const Avis = require("../Model/Avis");
const { authMiddleware } = require("../middleware/auth");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
    try {
        const avis = await Avis.find()
            .populate("userId", "nom") 
            .sort({ createdAt: -1 });   
        res.status(200).json(avis);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des avis" });
    }
});


router.post("/", authMiddleware, async (req, res) => {
    try {
        const { rating, text } = req.body;
        const userId = req.user.userId;
        console.log("REQ.BODY:", req.body);
        console.log("USER ID:", userId);

        if (!rating || !text) {
            return res.status(400).json({
                message: "Note et commentaire obligatoires",
            });
        }

        const avis = new Avis({
            userId,
            rating,
            text,
            verifiedPurchase: true, 
        });

        const savedAvis = await avis.save();
        res.status(201).json(savedAvis);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur lors de l'ajout de l'avis" });
    }
});

module.exports = router;
