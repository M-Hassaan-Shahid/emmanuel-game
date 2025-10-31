const mongoose = require("mongoose");
const betSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    bet_size: { type: Number },
    bet_line: { type: Number },
    bet_amount: { type: Number },
    bet_level: { type: Number },
    roundId: { type: String },
    status: { type: String, enum: ['active', 'cashed_out', 'lost'], default: 'active' },
    cashout_multiplier: { type: Number },
    crash_multiplier: { type: Number },
    winnings: { type: Number },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, collection: "bet" }
);

module.exports = mongoose.model("Bet", betSchema);
