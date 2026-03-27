// Model/Comment.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",      
        required: true
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    // 👍👎 Ajout
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reported: { type: Boolean, default: false },
});

module.exports = mongoose.model("Comment", commentSchema);