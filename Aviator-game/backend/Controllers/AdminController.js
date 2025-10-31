const bcrypt = require('bcryptjs');
const Admin = require('../Models/Admin');
const User = require('../Models/User');
const Transaction = require('../Models/Transaction');
const jwt = require("jsonwebtoken");
require('dotenv').config();

const insertadmin = async (req, res) => {
    const { password, ...data } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);

        const newadmin = new Admin({
            ...data,
            password: hashedpassword,
        });

        const result = await newadmin.save();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "error in inserting admin", error: err.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(404).json({ success: false, message: "please provide all fields" });
        }
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Email not found" });
        }
        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(404).json({ success: false, message: "Password does not match" });
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: "24h" },
        )

        const options = {
            expires: new Date(Date.now() + 2592000000),
            httpOnly: true,
            sameSite: "None",
        }
        res.cookie("token", token, options).json({
            success: true,
            token,
            admin: {
                _id: admin._id,
                email: admin.email,
                contact: admin.contact,
                role: 'admin'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error: " + err.message });
    }
}

const logout = async (req, res) => {
    res.clearCookie("connect.sid");
    res.clearCookie("token");
    res.status(200).json({ status: true, message: "Successfully logged out" });
}

// Get admin dashboard statistics
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ deleted_at: null });
        const activeUsers = await User.countDocuments({ deleted_at: null, status: 1 });

        const totalTransactions = await Transaction.countDocuments({ deleted_at: null });
        const pendingPayments = await Transaction.countDocuments({ status: 'pending', deleted_at: null });

        const rechargeSum = await Transaction.aggregate([
            { $match: { transactionType: 'recharge', status: 'approved', deleted_at: null } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const withdrawSum = await Transaction.aggregate([
            { $match: { transactionType: 'withdraw', status: 'approved', deleted_at: null } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalRecharge = rechargeSum[0]?.total || 0;
        const totalWithdraw = withdrawSum[0]?.total || 0;
        const revenue = totalRecharge - totalWithdraw;

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                totalTransactions,
                pendingPayments,
                totalRecharge,
                totalWithdraw,
                revenue
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: "Error fetching statistics", error: error.message });
    }
}

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;

        const query = { deleted_at: null };
        if (search) {
            query.$or = [
                { username: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { contact: new RegExp(search, 'i') }
            ];
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select('-password');

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
    }
}

// Get top users by balance
const getTopUsers = async (req, res) => {
    try {
        const topUsers = await User.find({ deleted_at: null })
            .sort({ balance: -1 })
            .limit(10)
            .select('-password');

        res.status(200).json({
            success: true,
            users: topUsers
        });
    } catch (error) {
        console.error('Get top users error:', error);
        res.status(500).json({ success: false, message: "Error fetching top users", error: error.message });
    }
}

module.exports = {
    insertadmin,
    login,
    logout,
    getStats,
    getAllUsers,
    getTopUsers
}
