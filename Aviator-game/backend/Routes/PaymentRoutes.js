const {
    getpayment,
    updatetransaction,
    getpaymentid,
    getUserPaymentHistory,
    createWithdrawal
} = require('../Controllers/PaymentController');
const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// ============================================
// USER ROUTES - Require Authentication
// ============================================

// Get user's own payment history
router.get('/history', verifyToken, getUserPaymentHistory);
router.get('/my-payments', verifyToken, getUserPaymentHistory);
router.post('/user-history', getUserPaymentHistory); // Alternative endpoint using userId in body
router.get('/getpaymentid', verifyToken, getpaymentid);

// Create withdrawal request
router.post('/withdraw', verifyToken, createWithdrawal);

// ============================================
// ADMIN ROUTES - Public for now (TODO: Add proper admin auth)
// ============================================

// Get all payments (admin only)
router.get('/getpayment', getpayment);

// Update transaction status (approve/reject)
router.post('/updatetransaction/:id', updatetransaction);

module.exports = router;
