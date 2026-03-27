// routes/product.js
const express = require("express");
const router = express.Router();
const Product = require("../Model/product");
const uploads = require("../middleware/multer-config");
const { authMiddleware, isAdmin } = require("../middleware/auth");
const { addProduct, getProducts, getProductById, deleteProduct, updateProduct, addComment } = require("../controllers/product");


router.post(
  "/add",
  authMiddleware,
  isAdmin,
  uploads.single("image"),
  addProduct
);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/comment", authMiddleware, addComment);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  uploads.single("image"),
  updateProduct
);

module.exports = router;











/*
const {
  addProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct
} = require("../controllers/product");

// ➤ Ajouter un produit
router.post(
  "/add",
  authMiddleware,
  isAdmin,
  uploads.single("image"),
  addProduct
);

// ➤ Récupérer tous les produits
router.get("/", getProducts);

// ➤ Récupérer un produit par ID
router.get("/:id", getProductById);

// ➤ Supprimer un produit
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

// ➤ Modifier un produit
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  uploads.single("image"),
  updateProduct
);


module.exports = router;
*/


/*
Ici je destructure req.body avec une valeur par défaut {} pour éviter undefined.
Le fallback imageBody || "" garantit que imageUrl n’est jamais undefined.
//22/11/2025
req.file est undefined. Cela veut dire que Multer ne reçoit pas le fichier. On va diagnostiquer étape par étape.
*/
