//Model/Return.js
const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            variantId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1,
            },
        },
    ],
    reason: {
        type: String,
        required: true,
    },
    description: String,
    returnLabels: [String],
    image: String,
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "refunded", "returned"],
        default: "pending",
    },
}, {
    timestamps: true // ✅ Ajoute createdAt ET updatedAt automatiquement
});

// ✅ Index pour les performances
returnSchema.index({ userId: 1, createdAt: -1 });
returnSchema.index({ orderId: 1 });

module.exports = mongoose.model("Return", returnSchema);


/*const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },

    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            variantId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],

    reason: {
        type: String,
        required: true,
    },

    description: {
        type: String,
    },
    returnLabels: [String],

    image: {
        type: String,
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "refunded"],
        default: "pending",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Return", returnSchema);

*/