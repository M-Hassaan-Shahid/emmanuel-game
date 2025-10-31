const User = require("../Models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const Promocode = require("../Models/User");
const { sendOTP, sendPasswordResetOTP } = require("../utils/mailer");

const sendmailsms = async (req, res) => {
  const { email, contact } = req.body;
  try {
    let existingUser;

    // Check for existing user by email or contact
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

    // Check if email is present and send OTP via email
    if (email) {
      // Send OTP via email using mailer utility
      const emailResult = await sendOTP(email, otp);

      if (emailResult.success) {
        console.log(`✅ OTP sent successfully to email: ${email}`);
      } else {
        console.error("❌ Error sending email:", emailResult.error);
        // Don't throw - let registration continue with fallback
      }
    }

    // Check if contact is present and send OTP via SMS
    if (contact) {
      const formattedContact = contact.startsWith("+")
        ? contact
        : `+92${contact}`;

      try {
        const twilioClient = twilio(
          process.env.TWILIO_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        // Use Twilio Verify API
        const verification = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({
            to: formattedContact,
            channel: 'sms'
          });

        console.log(`✅ SMS sent successfully via Twilio Verify to ${formattedContact}`);
        console.log(`Verification SID: ${verification.sid}`);
        console.log(`Status: ${verification.status}`);
      } catch (smsError) {
        console.error("❌ SMS Error:", smsError.message);
        console.error("Error Code:", smsError.code);
        // Don't throw - let registration continue with custom OTP
      }
    }

    const otpExpires = Date.now() + 10 * 60 * 1000;

    const newUser = new User({
      email,
      contact,
      otp, // Store OTP
      otpExpires,
      isVerified: false, // Mark as unverified until OTP is confirmed
      currency: 'STARS', // Telegram Stars currency
    });

    await newUser.save();
    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    console.error("Error sending OTP:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      command: error.command
    });
    res
      .status(500)
      .json({
        message: "Failed to send OTP",
        error: error.message,
        code: error.code
      });
  }
};

const verifyotpreg = async (req, res) => {
  const { email, contact, otp } = req.body;
  try {
    let user;

    if (email) {
      user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ message: "User not found with this email." });
      }
    }

    if (contact) {
      user = await User.findOne({ contact });

      if (!user) {
        return res
          .status(400)
          .json({ message: "User not found with this contact." });
      }

      // For phone verification, try Twilio Verify first
      try {
        const formattedContact = contact.startsWith("+") ? contact : `+92${contact}`;
        const twilioClient = twilio(
          process.env.TWILIO_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        const verificationCheck = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({
            to: formattedContact,
            code: otp
          });

        if (verificationCheck.status === 'approved') {
          user.isVerified = true;
          user.otp = undefined;
          user.otpExpiresAt = undefined;
          await user.save();
          return res.status(200).json({ message: "User verified successfully." });
        } else {
          return res.status(400).json({ message: "Invalid OTP." });
        }
      } catch (twilioError) {
        console.log("Twilio Verify failed, falling back to custom OTP");
        // Fall back to custom OTP verification
      }
    }

    // Check if OTP exists for the user (fallback for custom OTP)
    if (!user.otp) {
      return res.status(400).json({
        message: "OTP has not been generated or has already been used.",
      });
    }

    // Check if the OTP has expired
    if (user.otpExpiresreg && user.otpExpiresreg < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }
    if (user.otp == otp) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();

      return res.status(200).json({ message: "User verified successfully." });
    } else {
      return res.status(400).json({ message: "Invalid OTP." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const insertuser = async (req, res) => {
  const { password, promocode, ...userData } = req.body;

  try {
    // Check for required fields: password and either email or contact
    if (!password || (!userData.email && !userData.contact)) {
      return res.status(401).json({
        success: false,
        message:
          "Please provide all required fields: password and either email or contact.",
      });
    }

    // Password validation removed - allow any length

    const query = {};
    if (userData.email) query.email = userData.email;
    if (userData.contact) query.contact = userData.contact;

    const existingUser = await User.findOne(query);

    // Check for existing user by email or contact
    // const existingUser = await User.findOne({
    //   $or: [{ email: userData.email }, { contact: userData.contact }],
    // });

    if (existingUser) {
      // Update existing user's fields
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt); // Hash the password
      existingUser.currency = userData.currency || existingUser.currency; // Update currency if provided
      let uniqueUId;
      let isUnique = false;

      while (!isUnique) {
        uniqueUId = `T${Math.floor(10000 + Math.random() * 90000)}`; // Generates a string like 'T12345'
        const existingId = await User.findOne({ user_id: uniqueUId });
        if (!existingId) {
          isUnique = true; // If no existing user has this u_id, we can use it
        }
      }
      existingUser.user_id = uniqueUId; // Set the unique u_id

      // Generate user's referral code
      existingUser.promocode = `PROMO_${existingUser.user_id
        .toString()
        .slice(0, 4)
        .toUpperCase()}`;

      await existingUser.save();

      // Create referral promo code for this user
      const { createUserReferralCode } = require('./PromoCodeController');
      await createUserReferralCode(existingUser._id);

      // If user entered a promo code during registration, apply it
      if (promocode) {
        const PromoCode = require('../Models/PromoCode');
        const promoCodeDoc = await PromoCode.findOne({ code: promocode.toUpperCase() });

        if (promoCodeDoc && promoCodeDoc.isActive && !existingUser.promocodeStatus) {
          // Check expiration and usage limits
          const isExpired = promoCodeDoc.expirationDate && new Date() > promoCodeDoc.expirationDate;
          const isMaxedOut = promoCodeDoc.maxUses && promoCodeDoc.currentUses >= promoCodeDoc.maxUses;

          if (!isExpired && !isMaxedOut && !promoCodeDoc.usedBy.includes(existingUser._id)) {
            // Apply promo code
            existingUser.balance = (existingUser.balance || 0) + promoCodeDoc.reward;
            existingUser.promocodeStatus = true;
            existingUser.usedPromoCode = promocode.toUpperCase();

            // Reward referrer if it's a referral code
            if (promoCodeDoc.type === 'referral' && promoCodeDoc.createdBy) {
              const referrer = await User.findById(promoCodeDoc.createdBy);
              if (referrer) {
                referrer.balance = (referrer.balance || 0) + (promoCodeDoc.referrerReward || 0);
                await referrer.save();
                existingUser.referredBy = promoCodeDoc.createdBy;
              }
            }

            // Update promo code usage
            promoCodeDoc.currentUses += 1;
            promoCodeDoc.usedBy.push(existingUser._id);
            await promoCodeDoc.save();
            await existingUser.save();
          }
        }
      }

      return res
        .status(200)
        .json({ success: true, message: "User registered successfully" });
    }

    // If no existing user found, respond with an error
    return res.status(404).json({ success: false, message: "User not found" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error registration user",
      error: err.message,
    });
  }
};

const updateuser = async (req, res) => {
  const updatedata = req.body;
  const id = updatedata.id;
  try {
    const result = await User.updateOne(
      { _id: id },
      { $set: updatedata.oldData }
    );
    if (!result) {
      return res.status(404).json({ success: false, message: "user not found" });
    }
    return res.status(200).json({ success: true, result: result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "error in updating the user",
      error: err.message,
    });
  }
};

const userlogin = async (req, res) => {
  const { email, password, contact } = req.body;
  try {
    if (!password || (!email && !contact)) {
      return res
        .status(404)
        .json({ sucess: false, message: "please provide all fields" });
    }
    const query = {};
    if (email) query.email = email;
    if (contact) query.contact = contact;

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ sucess: false, message: "user not found" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(404)
        .json({ sucess: false, message: "Password does not match" });
    }
    const token = jwt.sign(
      { id: user._id, username: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const options = {
      expires: new Date(Date.now() + 2592000000),
      httpOnly: true,
      sameSite: "None",
    };
    res.cookie("token", token, options).json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

const getAlluser = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const search = req.query.search;

    const query = {
      deleted_at: null,
    };
    if (search) {
      query.username = { $regex: search, $options: "i" };
    }

    const result = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const count = await User.find(query).countDocuments();
    res.status(200).json({ success: true, result, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "error inserting user" });
  }
};
const getSingleuser = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await User.findOne({ _id: id });
    if (!result) {
      return res.status(404).json({ success: false, message: "user not found" });
    }
    return res.status(200).json({ success: true, result: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "error fetching user" });
  }
};

const deleteuser = async (req, res) => {
  try {
    const { id } = req.body;
    // Permanently delete user from database
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    res.status(200).json({
      success: true,
      message: "User permanently deleted",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "error deleting user" });
  }
};
const userlogout = async (req, res) => {
  res.clearCookie("connect.sid"); // Name of the session ID cookie
  res.clearCookie("token"); // Name of the session ID cookie
  res.status(200).json({ status: true, message: "Successfully logged out" });
};

const sendotp = async (req, res) => {
  const { email, contact } = req.body;
  console.log("Password reset OTP requested for:", email || contact);

  try {
    // Find user by email or contact
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (contact) {
      user = await User.findOne({ contact });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate OTP (6 digits for phone, 4 for email)
    const otp = contact
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // Update user with OTP
    const updateQuery = email ? { email: user.email } : { contact: user.contact };
    await User.updateOne(
      updateQuery,
      {
        $set: {
          resetOtp: otp,
          otpExpires: otpExpires,
        },
      }
    );

    // Send OTP via email or SMS
    if (email) {
      const emailResult = await sendPasswordResetOTP(email, otp);

      if (emailResult.success) {
        console.log(`✅ Password reset OTP sent to email: ${email}`);
        res.status(200).json({
          success: true,
          message: "OTP sent to your email",
        });
      } else {
        console.error("❌ Failed to send password reset email");
        console.log(`⚠️  FALLBACK OTP for ${email}: ${otp}`);
        res.status(200).json({
          success: true,
          message: "OTP generated (check server logs)",
          devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
        });
      }
    } else if (contact) {
      // Send SMS via Twilio
      const formattedContact = contact.startsWith("+") ? contact : `+92${contact}`;

      try {
        const twilioClient = twilio(
          process.env.TWILIO_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({
            to: formattedContact,
            channel: 'sms'
          });

        console.log(`✅ SMS OTP sent successfully to ${formattedContact}`);
        res.status(200).json({
          success: true,
          message: "OTP sent to your phone",
        });
      } catch (smsError) {
        console.error("❌ SMS Error:", smsError.message);
        res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }
    }
  } catch (err) {
    console.error("Error in sendotp:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, contact, otp } = req.body;

  try {
    // Find user by email or contact
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (contact) {
      user = await User.findOne({ contact });

      // Try Twilio Verify first for phone
      try {
        const formattedContact = contact.startsWith("+") ? contact : `+92${contact}`;
        const twilioClient = twilio(
          process.env.TWILIO_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        const verificationCheck = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({
            to: formattedContact,
            code: otp
          });

        if (verificationCheck.status === 'approved') {
          return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
          });
        }
      } catch (twilioError) {
        console.log("Twilio Verify failed, falling back to custom OTP");
      }
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires && user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("Error in verifyOtp:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};
const resetPassword = async (req, res) => {
  const { email, contact, newPassword } = req.body;
  try {
    // Check if identifier and new password are provided
    if ((!email && !contact) || !newPassword) {
      return res
        .status(400)
        .json({ message: "Identifier (email or phone) and new password are required." });
    }

    // Password validation removed - allow any length

    // Find the user by email or contact
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (contact) {
      user = await User.findOne({ contact });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset OTP
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    // Save the updated user
    await user.save();

    console.log(`✅ Password reset successfully for: ${email || contact}`);

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};
const addBalance = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: "User ID and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add amount to user's balance
    user.balance = (user.balance || 0) + parseFloat(amount);
    await user.save();

    // Create transaction record for admin balance addition
    const Transaction = require('../Models/Transaction');
    const transaction = new Transaction({
      user_id: userId,
      paymentType: 'telegram_stars',
      transactionType: 'recharge',
      amount: parseFloat(amount),
      status: 'approved', // Admin additions are auto-approved
      telegram_invoice_payload: 'admin_balance_addition',
      requested_date: new Date()
    });
    await transaction.save();

    console.log(`💰 Admin added ${amount} Stars to user ${user.user_id || userId}`);

    res.status(200).json({
      success: true,
      message: "Balance added successfully",
      newBalance: user.balance,
    });
  } catch (error) {
    console.error("Error adding balance:", error);
    res.status(500).json({
      success: false,
      message: "Error adding balance",
      error: error.message,
    });
  }
};

module.exports = {
  insertuser,
  updateuser,
  userlogin,
  getAlluser,
  getSingleuser,
  deleteuser,
  userlogout,
  sendotp,
  verifyOtp,
  resetPassword,
  sendmailsms,
  verifyotpreg,
  addBalance,
};
