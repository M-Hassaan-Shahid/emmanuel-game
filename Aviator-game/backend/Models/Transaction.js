const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Changed from 'User' to 'user' to match User model registration
    },
    paymentType: {
        type: String,
        enum: ['telegram_stars'], // Only Telegram Stars
        default: 'telegram_stars'
    },
    transactionType: {
        type: String,
        enum: ['recharge', 'withdraw'], // Transaction types
    },
    amount: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    telegram_charge_id: {
        type: String, // Telegram payment charge ID
    },
    telegram_invoice_payload: {
        type: String, // Invoice payload for tracking
    },
    requested_date: {
        type: Date,
        default: Date.now
    },
    deleted_at: {
        type: Date,
        default: null,
    },
}, { timestamps: true, collection: "transaction" });

module.exports = mongoose.model('Transaction', transactionSchema)
