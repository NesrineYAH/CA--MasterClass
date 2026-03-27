const express = require("express");
const router = express.Router();
const userController = require("../Controller/user.js");
const auth = require("../Middleware/auth");

router.post("/register", userController.Register);
router.post("/login", userController.Login);

// Protected routes
router.get("/profile", auth, userController.getProfile);

module.exports = router;
