const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },
        type: {
            type: String,
            enum: ['referral', 'admin'],
            default: 'admin'
        },
        reward: {
            type: Number,
            required: true
        },
        referrerReward: {
            type: Number,
            default: 0
        }, // Reward for the person who shared the code
        maxUses: {
            type: Number,
            default: null
        }, // null = unlimited
        currentUses: {
            type: Number,
            default: 0
        },
        expirationDate: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }, // For referral codes
        usedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }], // Track who used this code
    },
    { timestamps: true, collection: "promocode" }
);

module.exports = mongoose.model('PromoCode', promoCodeSchema);
