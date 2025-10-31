const mongoose = require("mongoose");

const bankSchma = new mongoose.Schema(
  {
    bankName: { type: String },
    accountNo: { type: String },
    accountholdername: { type: String },
    ifscCode: { type: String },
    mobileNo: { type: String },
    upiId: { type: String },
    QrCode:{
        publicId: { type: String },
        url: { type: String },
        originalname: { type: String },
        mimetype: { type: String },
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "bankdetails",
  }
);

module.exports = mongoose.model("Bank", bankSchma);
