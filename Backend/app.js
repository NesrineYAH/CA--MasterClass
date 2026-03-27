// Backend/app.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
// Routes
const userRoutes = require("./routes/users");


/*
const ProductRoutes = require("./routes/product");
const categorieRoutes = require("./routes/categories");
const cartRoutes = require("./routes/carts");
const addressRoutes = require("./routes/addresses");
const orderRoutes = require("./routes/orders");
const stripeRoute = require("./routes/stripe");
const commentsRoutes = require("./routes/comments");
const paymentMethodsRoutes = require("./routes/paymentMethods");
const paymentsRoute = require("./routes/payments");
const favoritesRoutes = require("./routes/favorites");
const { authMiddleware } = require("./middleware/auth");
*/
const cookieParser = require("cookie-parser");

require("./mongoDB/DB");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" })
);

// ⚡ Middlewares globaux
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/stripe", stripeRoute);
app.use("/api/payment", paymentsRoute);


app.use("/uploads", express.static("uploads"));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/etiquettes", express.static(path.join(__dirname, "public/etiquettes")));
app.use("/invoices", express.static(path.join(__dirname, "public/invoices")));

app.use("/api/users", userRoutes);
/*
app.use("/api/products", ProductRoutes);
app.use("/api/products", commentsRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
*/


app.use("/api", authMiddleware, paymentMethodsRoutes);
app.use("/api/users/favorites", favoritesRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Backend Parfum API en marche !");
});

module.exports = app;



