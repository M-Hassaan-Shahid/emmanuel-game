const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true,
    },
    paymentType: {
        type: String,
        enum: ['telegram_stars'], // Only Telegram Stars
        default: 'telegram_stars',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending',
    },
    telegram_charge_id: {
        type: String, // Telegram payment charge ID
    },
    telegram_invoice_payload: {
        type: String, // Invoice payload for tracking
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Payment', paymentSchema);
