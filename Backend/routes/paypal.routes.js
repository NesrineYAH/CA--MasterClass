// routes/paypal.routes.js
const express = require("express");
const router = express.Router();
const { createOrder, captureOrder } = require("../controllers/paypal.controller");
const { authMiddleware } = require("../middleware/auth");

router.post("/create-order", authMiddleware, createOrder);
router.post("/capture-order", authMiddleware, captureOrder);

module.exports = router;