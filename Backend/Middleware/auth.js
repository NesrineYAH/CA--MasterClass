// Backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../Model/User");
require("dotenv").config();

async function authMiddleware(req, res, next) {
    try {
        const tokenFromCookie = req.cookies?.token || req.cookies?.jwt;
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

        const token = tokenFromCookie || tokenFromHeader;
        if (!token) return res.status(401).json({ error: "Non authentifié" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ error: "Utilisateur introuvable" });
        }

        req.user = {
            ...user.toObject(),
            userId: user._id.toString(),
        };

        next();
    } catch (error) {
        console.error("Erreur authMiddleware :", error);
        res.status(401).json({ error: "Token invalide" });
    }
}

function isAdmin(req, res, next) {
    if (req.user && (req.user.role === "admin" || req.user.role === "vendeur")) {
        next();
    } else {
        res.status(403).json({ error: "Accès interdit" });
    }
}

module.exports = { authMiddleware, isAdmin };