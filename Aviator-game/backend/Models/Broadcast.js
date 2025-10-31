const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['info', 'warning', 'success', 'error'],
            default: 'info',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
        },
        deleted_at: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true, collection: 'broadcasts' }
);

module.exports = mongoose.model('Broadcast', broadcastSchema);
