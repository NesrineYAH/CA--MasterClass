const express = require("express");
const router = express.Router();
const Comment = require("../Model/Comment");
const Product = require("../Model/product");
const Notification = require("../Model/Notification");
const mongoose = require("mongoose");
const { authMiddleware } = require("../middleware/auth");

router.get("/:id/comments", async (req, res) => {
    try {
        const productId = req.params.id;

        const comments = await Comment.find({ productId })
            .populate("userId", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la récupération des commentaires",
        });
    }
});


// ✅ Ajouter un commentaire à un produit POST /api/products/:id/comments 
router.post("/:id/comments", authMiddleware, async (req, res) => {
    try {
        const { rating, text } = req.body;
        const userId = req.user?._id || req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non authentifié" });
        }

        if (!text || text.trim() === "" || rating === undefined) {
            return res.status(400).json({ error: "Rating et texte sont requis" });
        }

        const ratingNumber = Number(rating);
        if (Number.isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
            return res.status(400).json({ error: "Rating invalide" });
        }

        const productId = req.params.id;

        // ✅ Récupérer le produit avant de créer la notification
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        // Créer le commentaire
        const comment = new Comment({
            productId,
            userId,
            rating: ratingNumber,
            text: text.trim(),
        });

        await comment.save();

        // 🔄 Recalcul de la note moyenne
        const comments = await Comment.find({ productId });
        const avgRating =
            comments.reduce((acc, c) => acc + c.rating, 0) / comments.length;

        await Product.findByIdAndUpdate(productId, { rating: avgRating });

        // 🔔 Créer la notification pour le propriétaire du produit
        if (product.ownerId) {
            await Notification.create({
                userId: product.ownerId,
                title: "Nouveau commentaire",
                message: "Un utilisateur a commenté votre produit",
                type: "comment",
            });
        } else {
            console.warn("Produit sans ownerId, notification non créée");
        }


        res.status(201).json({
            message: "Commentaire ajouté",
            comment,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de l'ajout du commentaire",
        });
    }
});


// 🚩 REPORT
router.post("/:productId/comments/:commentId/report", authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        await Comment.findByIdAndUpdate(commentId, { reported: true });
        res.json({ message: "Commentaire signalé" });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
}
);

// 👍 LIKE
router.post("/:productId/comments/:commentId/like", authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;
        const comment = await Comment.findById(commentId);
        if (!comment)
            return res.status(404).json({ error: "Commentaire introuvable" });
        if (comment.likes.includes(userId)) {
            comment.likes.pull(userId);
        } else {
            comment.likes.push(userId);
            comment.dislikes.pull(userId);
        }
        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
}
);

// route poster un like sur un commentaire
router.post("/:productId/comments/:commentId/dislike", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment)
            return res.status(404).json({ error: "Commentaire introuvable" });


        if (comment.dislikes.includes(userId)) {
            comment.dislikes.pull(userId);
        } else {
            comment.dislikes.push(userId);
            comment.likes.pull(userId); // Retire le like si existant
        }

        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
}
);

module.exports = router;

/*
const stats = await Comment.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } }
]);

const avgRating = stats[0]?.avgRating || 0;

*/

/*
// ✅ Récupérer les commentaires d’un produit
router.get("/products/:id/comments", async (req, res) => {
    try {
        const productId = req.params.id;

        const comments = await Comment.find({ productId })
            .populate("userId", "username email") // récupère infos utilisateur
            .sort({ createdAt: -1 }); // tri par date

        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des commentaires" });
    }
});

router.post("/:id/comment", authMiddleware, async (req, res) => {
    try {
        const { rating, text } = req.body;
        const userId = req.user?._id || req.user?.userId;
        console.log("AUTH TYPE:", typeof authMiddleware);

        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non authentifié" });
        }

        if (!text || text.trim() === "" || rating === undefined) {
            return res.status(400).json({ error: "Rating et texte sont requis" });
        }

        const ratingNumber = Number(rating);
        if (Number.isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
            return res.status(400).json({ error: "Rating invalide" });
        }

        const productId = req.params.id;

        const comment = new Comment({
            productId,
            userId,
            rating: ratingNumber,
            text: text.trim(),
        });
        await comment.save();

        const comments = await Comment.find({ productId });
        const avgRating =
            comments.reduce((acc, c) => acc + c.rating, 0) / comments.length;

        await Product.findByIdAndUpdate(productId, { rating: avgRating });

        res.status(201).json({ message: "Commentaire ajouté", comment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'ajout du commentaire" });
    }
});


module.exports = router;
*/

/*
router.get("/products/:id/comments", async (req, res) => {
    try {
        const productId = req.params.id;

        const comments = await Comment.find({ productId })
            .populate("userId", "username email") // récupère infos utilisateur
            .sort({ createdAt: -1 }); // tri par date

        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des commentaires" });
    }
});

module.exports = router;
*/
