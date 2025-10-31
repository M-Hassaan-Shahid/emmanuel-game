const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    player_id: {
        type: String,       
    },
    user_id: {
        type: String,
    },
    entries: { type: Number, default: 0 },
    exits: { type: Number, default: 0 },
    currency: { type: Number, default: 0 },
    winning_percentage:{ type: Number},    
    balance:{ type: Number},
    totalBets: {
        type: Number,
        default: 0 // Sum of all bets placed by the player
    },
    totalWins: {
        type: Number,
        default: 0 // Total winnings from the Aviator game
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
