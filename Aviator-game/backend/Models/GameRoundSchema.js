const mongoose = require('mongoose');

const gameRoundSchema = new mongoose.Schema({
  roundId: { type: String, required: true, unique: true },
  startTime: { type: Date, required: true },
  crashTime: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'started', 'crashed'], default: 'pending' },
});

const GameRound = mongoose.model('GameRound', gameRoundSchema);

module.exports = GameRound;
