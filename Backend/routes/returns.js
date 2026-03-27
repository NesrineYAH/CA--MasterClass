//routes/return.js
const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middleware/auth");
const returnCtrl = require("../controllers/return");

router.post("/create", authMiddleware, returnCtrl.createReturnRequest);
router.put("/:returnId/approve", authMiddleware, isAdmin, returnCtrl.approveReturn);
router.put("/:returnId/refund", authMiddleware, isAdmin, returnCtrl.refundProduct);


module.exports = router;
