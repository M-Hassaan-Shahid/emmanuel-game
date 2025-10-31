const Transaction = require('../Models/Transaction');
const User = require('../Models/User');


const getpayment = async (req, res) => {

    try {
        const pageSize = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const search = req.query.search;
        const transactionType = req.query.transactionType;
        const paymentType = req.query.paymentType;
        const status = req.query.status;
        const query = {
            deleted_at: null,
        };
        if (search) {
            query.amount = { $regex: search, $options: "i" };
        }

        if (paymentType) {
            query.paymentType = paymentType; // telegram_stars
        }
        if (status) {
            query.status = status; // pending, approved, rejected
        }

        if (transactionType) {
            query.transactionType = transactionType; // e.g., 'recharge' or 'withdraw'
        }
        const result = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
        const count = await Transaction.find(query).countDocuments();
        res.status(200).json({ success: true, result, count });

    } catch (error) {
        res.status(500).json({ success: false, message: "error fetching transaction", error: error.message });
    }
}

const updatetransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, type } = req.body;

        // Validate input
        if (!status || !type) {
            return res.status(400).json({
                success: false,
                message: "Status and type are required"
            });
        }

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        // Check if transaction is already processed
        if (transaction.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Transaction already ${transaction.status}`
            });
        }

        const user = await User.findById(transaction.user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update transaction status
        transaction.status = status;

        if (status === 'approved') {
            if (type === 'recharge') {
                // Add amount to user balance
                user.balance += transaction.amount;
                user.last_recharge = transaction.amount;
                await user.save();
                console.log(`✅ Recharge approved: User ${user._id} balance increased by ${transaction.amount}`);
            } else if (type === 'withdraw') {
                // Check if user has sufficient balance
                if (user.balance < transaction.amount) {
                    transaction.status = 'rejected';
                    await transaction.save();
                    return res.status(400).json({
                        success: false,
                        message: "Insufficient balance for withdrawal"
                    });
                }
                // Deduct amount from user balance
                user.balance -= transaction.amount;
                await user.save();
                console.log(`✅ Withdrawal approved: User ${user._id} balance decreased by ${transaction.amount}`);
            }
        } else if (status === 'rejected') {
            console.log(`❌ Transaction rejected: ${id}`);
        }

        await transaction.save();

        res.status(200).json({
            success: true,
            message: `Transaction ${status} successfully`,
            newBalance: user.balance
        });

    } catch (err) {
        console.error("Error updating transaction:", err);
        res.status(500).json({
            success: false,
            message: "Error updating transaction",
            error: err.message
        });
    }
}

const getpaymentid = async (req, res) => {
    const { id, transactionType } = req.query; // Destructure id and transactionType from req.query

    console.log(req.query);

    try {
        const query = { _id: id }; // Build the query with _id

        if (transactionType) {
            query.transactionType = transactionType; // Add transactionType if it exists
        }

        const result = await Transaction.find(query); // Query the database
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No transactions found" });
        }

        res.status(201).json({ success: true, result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }

}

// Get user's payment history
const getUserPaymentHistory = async (req, res) => {
    try {
        // Support both authenticated requests and userId in body
        const userId = req.user?._id || req.body.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const { page = 1, limit = 10, transactionType, status } = req.query;

        const query = {
            user_id: userId,
            deleted_at: null
        };

        if (transactionType) {
            query.transactionType = transactionType;
        }

        if (status) {
            query.status = status;
        }

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const count = await Transaction.countDocuments(query);

        res.status(200).json({
            success: true,
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        console.error("Error fetching user payment history:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching payment history",
            error: error.message
        });
    }
};

// Create withdrawal request
const createWithdrawal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid withdrawal amount"
            });
        }

        // Check minimum withdrawal
        if (amount < 100) {
            return res.status(400).json({
                success: false,
                message: "Minimum withdrawal amount is 100 Stars"
            });
        }

        // Get user balance
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user has sufficient balance
        if (user.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance"
            });
        }

        // Create withdrawal transaction
        const transaction = new Transaction({
            user_id: userId,
            paymentType: 'telegram_stars',
            transactionType: 'withdraw',
            amount: amount,
            status: 'pending'
        });

        await transaction.save();

        res.status(201).json({
            success: true,
            message: "Withdrawal request submitted successfully",
            transaction
        });

    } catch (error) {
        console.error("Withdrawal error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating withdrawal request",
            error: error.message
        });
    }
};

module.exports = {
    getpaymentid,
    getpayment,
    updatetransaction,
    getUserPaymentHistory,
    createWithdrawal,
}