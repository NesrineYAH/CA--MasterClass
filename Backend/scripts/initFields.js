const mongoose = require("mongoose");
const Product = require("../Model/product");
require("dotenv").config();


async function initFields() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/parfumesShopsDB", {
        });

        await Product.updateMany(
            {},
            { $set: { rating: 0, comments: [] } }
        );

        process.exit();
    } catch (error) {
        console.error("Erreur :", error);
        process.exit(1);
    }
}

initFields();
