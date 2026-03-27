// Routes/orders.js
const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middleware/auth");
const orderCtrl = require("../controllers/order");
const returnCtrl = require("../controllers/return");


router.post("/create", authMiddleware, orderCtrl.createOrder);
router.post("/finalize/:orderId", authMiddleware, orderCtrl.finalizeOrder);

router.get("/my-orders", authMiddleware, orderCtrl.getMyOrders);
router.get("/user/:userId", authMiddleware, orderCtrl.getOrdersByUserId);

router.get("/all", authMiddleware, isAdmin, orderCtrl.getAllOrders);
router.get("/admin", authMiddleware, isAdmin, orderCtrl.getAllOrdersAdmin);

router.put("/:orderId", authMiddleware, orderCtrl.updateOrder);

router.put("/:orderId/ship", authMiddleware, isAdmin, orderCtrl.shipOrder);
router.post("/:orderId/deliver", authMiddleware, orderCtrl.deliverOrder);
router.post("/:orderId/cancel", authMiddleware, orderCtrl.cancelOrder);
router.post("/:orderId/refund", authMiddleware, isAdmin, orderCtrl.refundOrder);
router.put("/:orderId/:productId/received", authMiddleware, isAdmin,returnCtrl.markAsReturned
);
router.put(
    "/:orderId/:productId/refund",
    authMiddleware,
    isAdmin,
    returnCtrl.refundProduct
);


router.delete("/:orderId", authMiddleware, orderCtrl.deleteOrder);

router.get("/:orderId", authMiddleware, orderCtrl.getOrderById);



module.exports = router;







/*
- POST /api/orders/create → createOrder
- PUT /api/orders/:id → updateOrder
- POST /api/orders/finalize/:id → finalizeOrder
- GET /api/orders/my-orders → getMyOrders
- DELETE /api/orders/:id → deleteOrder
- GET /api/orders/all → getAllOrders
- GET /api/orders/user/:userId → getOrdersByUserId

*/
