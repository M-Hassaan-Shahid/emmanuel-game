// ⚠️ DEPRECATED: This controller is not used for Telegram Stars payments
// Bank details are not needed since all payments are handled via Telegram
// Consider removing this file in future cleanup

const Bank = require('../Models/BankDetail');
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadImage = (buffer, originalname, mimetype) => {
  return new Promise((resolve, reject) => {
    if (!mimetype || typeof mimetype !== "string") {
      return reject(new Error("MIME type is required and must be a string"));
    }

    if (!mimetype.startsWith("image")) {
      return reject(new Error("Only image files are supported"));
    }

    const fileNameWithoutExtension = path.basename(originalname);
    const publicId = `${fileNameWithoutExtension}`;
    const options = {
      resource_type: "image", // Only images are allowed
      public_id: publicId,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    const dataURI = `data:${mimetype};base64,${buffer.toString("base64")}`;

    cloudinary.uploader.upload(
      dataURI,
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          return reject(
            new Error(`Cloudinary upload failed: ${error.message}`)
          );
        }
        resolve(result);
      }
    );
  });
};

const deleteImage = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const updatebankdetails = async (req, res) => {
  if (req.file) {
    const { originalname, buffer, mimetype } = req.file;
    if (!mimetype || typeof mimetype !== 'string') {
      console.error("Invalid MIME type:", mimetype);
      return res.status(400).json({ success: false, message: "Invalid MIME type" });
    }
    try {
      const uploadResult = await uploadImage(buffer, originalname, mimetype);
      if (!uploadResult) {
        return res.status(500).json({ success: false, message: "File upload error" });
      }
      const bankData = req.body;
      const updatedbankData = {
        ...bankData,
        QrCode: {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          originalname: originalname,
          mimetype: req.file.mimetype,
        },
      };

      const result = await Bank.updateOne(
        { $set: updatedbankData }
      ); // Update the first document found
      if (!result) {
        return res.status(404).json({ success: false, message: "No changes made to the bank details." });
      }
      res.status(200).json({ success: true, result: result });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error in updating the bank details", error: err.message });
    }
  } else {
    try {
      const result = await Bank.updateOne({ $set: req.body }); // Update the first document found
      if (!result) {
        return res.status(404).json({ success: false, message: "No changes made to the bank details." });
      }
      res.status(200).json({ success: true, result: result });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error in updating the bank details", error: err.message });
    }
  }
}

const getbankdetails = async (req, res) => {
  try {
    const result = await Bank.find(); // Update the first document found
    if (!result) {
      return res.status(404).json({ success: false, message: "bank detail not found" });
    }
    res.status(200).json({ success: true, result: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching bank details", error: err.message });
  }
}

module.exports = {
  updatebankdetails,
  getbankdetails

}