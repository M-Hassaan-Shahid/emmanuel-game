// DEVELOPMENT VERSION - Logs OTP to console instead of sending email
// Use this temporarily to test without email setup

const User = require("../Models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const sendmailsms = async (req, res) => {
    const { email, contact } = req.body;
    try {
        let existingUser;

        if (email) {
            existingUser = await User.findOne({ email });
        }

        if (contact) {
            existingUser = await User.findOne({ contact });
        }

        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Email or mobile number already used." });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000)
            .toString()
            .padStart(6, "0");

        // DEVELOPMENT MODE: Just log OTP instead of sending email
        console.log("=".repeat(60));
        console.log("📧 DEVELOPMENT MODE - OTP Generated");
        console.log("=".repeat(60));
        if (email) {
            console.log(`Email: ${email}`);
        }
        if (contact) {
            console.log(`Contact: ${contact}`);
        }
        console.log(`OTP: ${otp}`);
        console.log("=".repeat(60));
        console.log("Copy this OTP and paste it in the verification screen");
        console.log("=".repeat(60));

        const otpExpires = Date.now() + 10 * 60 * 1000;

        const newUser = new User({
            email,
            contact,
            otp,
            otpExpires,
            isVerified: false,
        });

        await newUser.save();
        res.status(200).json({
            message: "OTP sent successfully (check backend console)",
            otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only send OTP in dev mode
        });
    } catch (error) {
        console.error("Error in sendmailsms:", error);
        res.status(500).json({
            message: "Failed to process request",
            error: error.message
        });
    }
};

// Export the rest of the functions from the original file
module.exports = {
    sendmailsms,
    // ... other exports
};
