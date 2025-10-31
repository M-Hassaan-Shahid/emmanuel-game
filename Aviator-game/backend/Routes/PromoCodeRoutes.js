const {
    getAllPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    applyPromoCode,
    validatePromoCode,
    // Legacy
    getsetting,
    insertsetting,
    updatesetting
} = require('../Controllers/PromoCodeController');
const express = require('express');
const router = express.Router();

// New routes
router.get('/promocodes', getAllPromoCodes);
router.post('/promocodes', createPromoCode);
router.put('/promocodes/:id', updatePromoCode);
router.delete('/promocodes/:id', deletePromoCode);
router.post('/promocodes/apply', applyPromoCode);
router.post('/promocodes/validate', validatePromoCode);

// Legacy routes (for backward compatibility)
router.put('/updatePromoCodesetting/:id', updatesetting);
router.put('/updatePromoCodesetting', (req, res) => {
    // Handle legacy route without ID - return success to prevent errors
    res.status(200).json({ success: true, message: "Legacy endpoint - no action taken" });
});
router.get('/getPromoCodeSetting', getsetting);
router.post('/insertPromoCodesetting', insertsetting);

module.exports = router;