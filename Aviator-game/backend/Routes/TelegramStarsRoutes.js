const express = require('express');
const router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
const User = require('../Models/User');
const Transaction = require('../Models/Transaction');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Create Telegram Stars Invoice Link (for web app)
router.post('/create-invoice', async (req, res) => {
    try {
        const { userId, amount, description } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'User ID and amount are required'
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create invoice payload
        const payload = `web_stars_${userId}_${amount}_${Date.now()}`;
        const title = `Add ${amount} Stars`;
        const desc = description || `Add ${amount} Stars to your Aviator game balance`;
        const currency = 'XTR'; // Telegram Stars
        const prices = [{ label: 'Telegram Stars', amount: amount }];

        // Create invoice link (Telegram Web App payment)
        const invoiceLink = await bot.createInvoiceLink(
            title,
            desc,
            payload,
            '', // provider_token (empty for Stars)
            currency,
            prices,
            {
                need_name: false,
                need_phone_number: false,
                need_email: false,
                need_shipping_address: false,
                is_flexible: false
            }
        );

        // Create pending transaction
        const transaction = new Transaction({
            user_id: userId,
            amount: amount,
            transactionType: 'recharge',
            paymentType: 'telegram_stars',
            status: 'pending',
            telegram_invoice_payload: payload
        });
        await transaction.save();

        res.json({
            success: true,
            message: 'Invoice created successfully',
            invoiceLink: invoiceLink,
            transactionId: transaction._id
        });

    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create invoice'
        });
    }
});

// Check payment status
router.get('/payment-status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            status: transaction.status,
            amount: transaction.amount,
            transactionType: transaction.transactionType
        });

    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status'
        });
    }
});

// Handle payment webhook (called by Telegram bot)
router.post('/payment-webhook', async (req, res) => {
    try {
        const { payload, userId, amount, telegram_charge_id } = req.body;

        // Find transaction by payload
        const transaction = await Transaction.findOne({ telegram_invoice_payload: payload });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Update transaction status
        transaction.status = 'approved';
        transaction.telegram_charge_id = telegram_charge_id;
        await transaction.save();

        // Update user balance
        const user = await User.findById(transaction.user_id);
        if (user) {
            user.balance = (user.balance || 0) + amount;
            await user.save();
        }

        res.json({
            success: true,
            message: 'Payment processed successfully'
        });

    } catch (error) {
        console.error('Payment webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment'
        });
    }
});

module.exports = router;
