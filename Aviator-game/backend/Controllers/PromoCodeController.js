const PromoCode = require("../Models/PromoCode");
const User = require("../Models/User");

// Get all promo codes (Admin)
const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find()
      .populate('createdBy', 'username email user_id')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, result: promoCodes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching promo codes", error: err.message });
  }
};

// Create admin promo code
const createPromoCode = async (req, res) => {
  try {
    const { code, reward, referrerReward, maxUses, expirationDate } = req.body;

    if (!code || !reward) {
      return res.status(400).json({ success: false, message: "Code and reward are required" });
    }

    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: "Promo code already exists" });
    }

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      type: 'admin',
      reward: parseFloat(reward),
      referrerReward: parseFloat(referrerReward) || 0,
      maxUses: maxUses ? parseInt(maxUses) : null,
      expirationDate: expirationDate || null,
    });

    const savedPromoCode = await promoCode.save();
    console.log('Promo code saved to database:', savedPromoCode);
    res.status(201).json({ success: true, message: "Promo code created successfully", result: savedPromoCode });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating promo code", error: err.message });
  }
};

// Update promo code
const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { reward, referrerReward, maxUses, expirationDate, isActive } = req.body;

    const promoCode = await PromoCode.findByIdAndUpdate(
      id,
      {
        reward: reward ? parseFloat(reward) : undefined,
        referrerReward: referrerReward ? parseFloat(referrerReward) : undefined,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        expirationDate: expirationDate || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!promoCode) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    res.status(200).json({ success: true, message: "Promo code updated successfully", result: promoCode });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating promo code", error: err.message });
  }
};

// Delete promo code
const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const promoCode = await PromoCode.findByIdAndDelete(id);

    if (!promoCode) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }

    res.status(200).json({ success: true, message: "Promo code deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting promo code", error: err.message });
  }
};

// Validate and apply promo code
const applyPromoCode = async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ success: false, message: "Code and user ID are required" });
    }

    // Find the promo code
    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

    if (!promoCode) {
      return res.status(404).json({ success: false, message: "Invalid promo code" });
    }

    // Check if active
    if (!promoCode.isActive) {
      return res.status(400).json({ success: false, message: "This promo code is no longer active" });
    }

    // Check expiration
    if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
      return res.status(400).json({ success: false, message: "This promo code has expired" });
    }

    // Check max uses
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return res.status(400).json({ success: false, message: "This promo code has reached its usage limit" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user already used this code
    if (promoCode.usedBy.includes(userId)) {
      return res.status(400).json({ success: false, message: "You have already used this promo code" });
    }

    // Check if user already used any promo code (one-time use per user)
    if (user.promocodeStatus) {
      return res.status(400).json({ success: false, message: "You have already used a promo code" });
    }

    // Apply the promo code
    user.balance = (user.balance || 0) + promoCode.reward;
    user.promocodeStatus = true;
    user.usedPromoCode = code.toUpperCase();

    // If it's a referral code, reward the referrer
    if (promoCode.type === 'referral' && promoCode.createdBy) {
      const referrer = await User.findById(promoCode.createdBy);
      if (referrer) {
        referrer.balance = (referrer.balance || 0) + (promoCode.referrerReward || 0);
        await referrer.save();
        user.referredBy = promoCode.createdBy;
      }
    }

    // Update promo code usage
    promoCode.currentUses += 1;
    promoCode.usedBy.push(userId);

    await user.save();
    await promoCode.save();

    res.status(200).json({
      success: true,
      message: `Promo code applied! You received ${promoCode.reward} stars!`,
      reward: promoCode.reward,
      newBalance: user.balance
    });
  } catch (err) {
    console.error('Error applying promo code:', err);
    res.status(500).json({ success: false, message: "Error applying promo code", error: err.message });
  }
};

// Validate promo code (check without applying)
const validatePromoCode = async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Code is required" });
    }

    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

    if (!promoCode) {
      return res.status(404).json({ success: false, message: "Invalid promo code" });
    }

    if (!promoCode.isActive) {
      return res.status(400).json({ success: false, message: "This promo code is no longer active" });
    }

    if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
      return res.status(400).json({ success: false, message: "This promo code has expired" });
    }

    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return res.status(400).json({ success: false, message: "This promo code has reached its usage limit" });
    }

    if (userId) {
      const user = await User.findById(userId);
      if (user && promoCode.usedBy.includes(userId)) {
        return res.status(400).json({ success: false, message: "You have already used this promo code" });
      }
      if (user && user.promocodeStatus) {
        return res.status(400).json({ success: false, message: "You have already used a promo code" });
      }
    }

    res.status(200).json({
      success: true,
      message: "Valid promo code",
      reward: promoCode.reward,
      type: promoCode.type
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error validating promo code", error: err.message });
  }
};

// Create user referral code (auto-generated)
const createUserReferralCode = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.promocode) return null;

    // Check if referral code already exists
    const existingCode = await PromoCode.findOne({ code: user.promocode });
    if (existingCode) return existingCode;

    // Create referral promo code
    const referralCode = new PromoCode({
      code: user.promocode,
      type: 'referral',
      reward: 50, // New user gets 50 stars
      referrerReward: 50, // Referrer gets 50 stars
      createdBy: userId,
      isActive: true,
    });

    await referralCode.save();
    return referralCode;
  } catch (err) {
    console.error('Error creating referral code:', err);
    return null;
  }
};

// Legacy support
const getsetting = getAllPromoCodes;
const insertsetting = createPromoCode;
const updatesetting = updatePromoCode;

module.exports = {
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  applyPromoCode,
  validatePromoCode,
  createUserReferralCode,
  // Legacy
  getsetting,
  insertsetting,
  updatesetting,
};