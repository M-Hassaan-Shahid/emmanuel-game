const express = require("express");
const { sendOTP } = require("../utils/mailer");
const router = express.Router();

// Test email endpoint
router.post("/test-email", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }

    console.log("Testing email to:", email);

    // Generate test OTP
    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send test email
    const result = await sendOTP(email, testOtp);

    if (result.success) {
        res.status(200).json({
            success: true,
            message: "Test email sent successfully!",
            otp: testOtp, // Only for testing
            messageId: result.messageId,
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Failed to send test email",
            error: result.error,
        });
    }
});

module.exports = router;
