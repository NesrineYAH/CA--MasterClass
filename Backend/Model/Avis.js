const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        verifiedPurchase: {
            type: Boolean,
            default: true,
        },
        reported: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Avis", avisSchema);
