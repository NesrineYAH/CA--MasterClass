// controller/product.js
const Product = require("../Model/product");
const Cart = require("../Model/Cart");

require("dotenv").config();


exports.addProduct = async (req, res) => {
    try {
        const { nom, description, categorie_id, genre } = req.body;
        if (!nom || !categorie_id || !genre) {
            return res.status(400).json({
                message: "Nom, catégorie et genre sont requis",
            });
        }

        const genresAutorises = ["homme", "femme", "mixte"];
        if (!genresAutorises.includes(genre)) {
            return res.status(400).json({
                message: "Genre invalide (homme, femme ou mixte)",
            });
        }


        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const options = [
            { size: 10, unit: "ml", prix: 5, stock: 100 },
            { size: 30, unit: "ml", prix: 15, stock: 100 },
            { size: 50, unit: "ml", prix: 25, stock: 100 },
            { size: 100, unit: "ml", prix: 45, stock: 100 },
        ];

        const newProduct = new Product({
            nom,
            description,
            imageUrl,
            categorie_id,
            genre,
            options,
            ownerId: req.user.userId,
        });

        await newProduct.save();

        res.status(201).json({
            message: "Produit ajouté avec succès",
            product: newProduct,
        });
    } catch (error) {
        console.error("Erreur ajout produit :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};


exports.getProducts = async (req, res) => {
    try {
        const { genre } = req.query;

        let filter = {};

        if (genre) {
            filter.genre = genre;
        }
        const produits = await Product.find(filter);
        res.json(produits);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProductById = async (req, res) => {
    try {
        const produit = await Product.findById(req.params.id);
        if (!produit)
            return res.status(404).json({ message: "Produit non trouvé" });
        res.json(produit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const produit = await Product.findByIdAndDelete(req.params.id);
        if (!produit)
            return res.status(404).json({ message: "Produit non trouvé" });
        res.json({ message: "Produit supprimé" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.updateProduct = async (req, res) => {
    try {
        const { nom, prix, description, stock, categorie_id } = req.body;
        const updatedData = { nom, prix, description, stock, categorie_id };

        if (req.file) {
            updatedData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        if (!updatedProduct)
            return res.status(404).json({ message: "Produit introuvable" });

        res.json({
            message: "Produit modifié avec succès",
            product: updatedProduct,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { rating, text } = req.body;

        if (!rating) {
            return res.status(400).json({ error: "Champs manquants" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Produit introuvable" });
        }


        product.comments.push({
            userId: req.user.userId,
            rating,
            text,
        });


        product.rating =
            product.comments.reduce((sum, c) => sum + c.rating, 0) /
            product.comments.length;

        await product.save();

        const populatedProduct = await Product.findById(req.params.id).populate(
            "comments.userId",
            "nom prenom email"
        );

        return res.status(200).json({
            success: true,
            product: populatedProduct,
        });
    } catch (error) {
        console.error("Erreur ajout commentaire :", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
};




/*
18/12/2025 
Ici je destructure req.body avec une valeur par défaut {} pour éviter undefined.
Le fallback imageBody || "" garantit que imageUrl n’est jamais undefined.
//22/11/2025
req.file est undefined. Cela veut dire que Multer ne reçoit pas le fichier. On va diagnostiquer étape par étape.
*/
