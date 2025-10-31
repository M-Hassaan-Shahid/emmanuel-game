const mongoose = require("mongoose");

const PlaneCrashSchma = new mongoose.Schema(
  {
    firstValue: {type: String },
    secondValue: { type: String },
    crashPercentage: { type: String },
    deleted_at: {
        type: Date,
        default: null,
      },
  },
  {
    timestamps: true,
    collection: "planecrash",
  }
);

module.exports = mongoose.model("PlaneCrash", PlaneCrashSchma);
