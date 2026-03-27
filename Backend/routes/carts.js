// routes/cart.js
const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middleware/auth");
const cartCtrl = require("../controllers/cart");
const uploads = require("../middleware/multer-config");

router.post("/add", authMiddleware, cartCtrl.addToCart);
router.get("/", authMiddleware, cartCtrl.getCart);
router.put("/updateQuantity", authMiddleware, cartCtrl.updateQuantity);
router.delete("/removeItem/:variantId", authMiddleware, cartCtrl.removeItem);
router.delete("/clear", authMiddleware, cartCtrl.clearCart);
router.post("/sync", authMiddleware, cartCtrl.syncCart);


module.exports = router;
