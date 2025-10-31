const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    user_id: {
      type: String,
    },
    contact: { type: String },
    password: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      sparse: true // Allows multiple null values for Telegram-only accounts
    },
    balance: {
      type: Number,
      default: 0,
      comment: 'Balance in Telegram Stars'
    },
    last_recharge: {
      type: Number,
      default: 0,
      comment: 'Last recharge amount in Telegram Stars'
    },
    promocode: {
      type: String,
    },
    promocodeStatus: {
      type: Boolean,
      default: false,
    },
    usedPromoCode: {
      type: String,
    }, // Track which promo code this user used
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }, // Track who referred this user
    resetOtp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    otp: { type: String }, // Store OTP temporarily
    isVerified: { type: Boolean, default: false }, // Status to track verification
    otpExpiresreg: {
      type: Date,
    },
    currency: {
      type: String,
    },
    status: {
      type: Number,
      default: 1, // Tinyint equivalent
    },
    deleted_at: {
      type: Date,
      default: null,
    },
    // OAuth fields
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values
    },
    telegramId: {
      type: String,
      sparse: true,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    photo_url: {
      type: String,
    },
  },
  { timestamps: true, collection: "user" }
);

module.exports = mongoose.model("user", UserSchema);
